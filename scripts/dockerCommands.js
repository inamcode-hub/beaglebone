import path from 'path';
import shell from 'shelljs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import axios from 'axios'; // Import axios

// Determine the root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from the appropriate .env file
const envFilePath =
  process.argv[2] === 'runProd' ? '.env.production' : '.env.development';
dotenv.config({ path: path.join(rootDir, envFilePath) });

// Function to quote paths properly for Docker
function quotePath(p) {
  return `"${p.replace(/\\/g, '/')}"`;
}

// Function to get host IP address
function getHostIP() {
  const ip = execSync("hostname -I | awk '{print $1}'").toString().trim();
  return ip;
}

// Function to get public IP address
async function getPublicIP() {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    console.error('Error fetching public IP:', error);
    return getHostIP();
  }
}

const hostIP = getHostIP();

async function main() {
  const publicIP = await getPublicIP();
  if (!publicIP) {
    console.error('Unable to fetch public IP address.');
    process.exit(1);
  }

  // Environment-specific configurations
  const dockerDevEnvFile = quotePath(path.join(rootDir, '.env.development'));
  const dockerProdEnvFile = quotePath(path.join(rootDir, '.env.production'));
  const dockerDevVolume = quotePath(`${rootDir}:/usr/src/app`);
  const dockerDevImage = `${process.env.DOCKER_REPOSITORY_OWNER}/${process.env.DOCKER_REPOSITORY_NAME}-dev:latest`;
  const dockerProdImage = `${process.env.DOCKER_REPOSITORY_OWNER}/${process.env.DOCKER_REPOSITORY_NAME}:latest`;

  // Docker commands
  const commands = {
    buildDev: `docker build --load -t ${dockerDevImage} -f Dockerfile.dev .`,
    runDev: `docker run --network host --name beaglebone-app-dev --device=/dev/ttyS2 --env-file ${dockerDevEnvFile} -v ${dockerDevVolume} -e HOST_IP=${hostIP} -e PUBLIC_IP=${publicIP} ${dockerDevImage}`,
    buildProd: `docker build --load -t ${dockerProdImage} -f Dockerfile .`,
    runProd: `docker run --network host -d --name beaglebone-app --device=/dev/ttyS2 --env-file ${dockerProdEnvFile} -e HOST_IP=${hostIP} -e PUBLIC_IP=${publicIP} ${dockerProdImage}`,
  };

  // Function to check if a container is running and stop/remove it if necessary
  function handleExistingContainer(containerName) {
    const isRunning =
      shell.exec(
        `docker inspect --format="{{.State.Running}}" ${containerName}`,
        { silent: true }
      ).code === 0;
    if (isRunning) {
      console.log(
        `Container ${containerName} is already running. Stopping and removing it...`
      );
      shell.exec(`docker stop ${containerName}`);
      shell.exec(`docker rm ${containerName}`);
    } else {
      console.log(
        `Container ${containerName} does not exist or is not running.`
      );
    }
  }

  // Run command
  const command = process.argv[2];
  if (commands[command]) {
    const containerName =
      command === 'runProd' ? 'beaglebone-app' : 'beaglebone-app-dev';
    handleExistingContainer(containerName);
    shell.exec(commands[command]);
  } else {
    console.error(`Invalid command: ${command}`);
    process.exit(1);
  }
}

// Execute the main function
main();
