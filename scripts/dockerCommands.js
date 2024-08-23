import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import https from 'https';

// Determine the root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from a .env file
function loadEnvFile(filePath) {
  const envFileContent = fs.readFileSync(filePath, 'utf8');
  envFileContent.split('\n').forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const envFilePath = path.join(
  rootDir,
  process.argv[2] === 'runProd' ? '.env.production' : '.env.development'
);
loadEnvFile(envFilePath);

// Function to get host IP address
function getHostIP() {
  const ip = execSync("hostname -I | awk '{print $1}'").toString().trim();
  return ip;
}

// Function to get public IP address
function getPublicIP() {
  return new Promise((resolve, reject) => {
    https
      .get('https://api.ipify.org?format=json', (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            resolve(parsedData.ip);
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Function to get unique identifier (serial number or MAC address)
function getUniqueIdentifier() {
  try {
    const serialNumber = execSync(
      "cat /proc/cpuinfo | grep Serial | awk '{print $3}'"
    )
      .toString()
      .trim();
    if (serialNumber) {
      return serialNumber;
    } else {
      console.error('Unable to retrieve serial number.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching unique identifier:', error);
    return null;
  }
}

const hostIP = getHostIP();

async function main() {
  const publicIP = await getPublicIP();
  if (!publicIP) {
    console.error('Unable to fetch public IP address.');
    process.exit(1);
  }

  const uniqueIdentifier = getUniqueIdentifier();
  if (!uniqueIdentifier) {
    console.error('Unable to fetch unique identifier.');
    process.exit(1);
  }

  // Add the unique identifier to the environment variables
  process.env.BEAGLEBONE_SERIAL_NUMBER = uniqueIdentifier;

  // Docker commands
  const dockerDevImage = `${process.env.DOCKER_REPOSITORY_OWNER}/${process.env.DOCKER_REPOSITORY_NAME}-dev:latest`;
  const dockerProdImage = `${process.env.DOCKER_REPOSITORY_OWNER}/${process.env.DOCKER_REPOSITORY_NAME}:latest`;

  const commands = {
    buildDev: `docker build --load -t ${dockerDevImage} -f Dockerfile.dev .`,
    runDev: `docker run --network host --privileged --restart on-failure:5 --name beaglebone-app-dev --device=/dev/ttyS2 --env-file ${envFilePath} -v $(pwd):/usr/src/app -e HOST_IP=${hostIP} -e PUBLIC_IP=${publicIP} -e BEAGLEBONE_SERIAL_NUMBER=${uniqueIdentifier} ${dockerDevImage}`,
    buildProd: `docker build --load -t ${dockerProdImage} -f Dockerfile .`,
    runProd: `docker run --network host --privileged --restart on-failure:5 --restart always --name beaglebone-app --device=/dev/ttyS2 --env-file ${envFilePath} -v /:/host-root:ro -v /home/debian/scripts:/usr/local/bin/scripts -e HOST_IP=${hostIP} -e PUBLIC_IP=${publicIP} -e BEAGLEBONE_SERIAL_NUMBER=${uniqueIdentifier} ${dockerProdImage}`,
  };

  // Function to check if a container is running and stop/remove it if necessary
  function handleExistingContainer(containerName) {
    try {
      // Check if the container exists
      const exists = execSync(
        `docker ps -a --filter "name=${containerName}" --format "{{.Names}}"`
      )
        .toString()
        .trim();

      if (exists === containerName) {
        console.log(
          `Container ${containerName} exists. Stopping and removing it...`
        );
        execSync(`docker stop ${containerName}`);
        execSync(`docker rm ${containerName}`);
      } else {
        console.log(`Container ${containerName} does not exist.`);
      }
    } catch (error) {
      console.log(
        `Error handling container ${containerName}: ${error.message}`
      );
    }
  }
  // Function to execute Docker commands
  function runCommand(command) {
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error('Command failed:', error.message);
      process.exit(1);
    }
  }

  // Determine the command to run
  const command = process.argv[2];
  if (commands[command]) {
    const containerName =
      command === 'runProd' ? 'beaglebone-app' : 'beaglebone-app-dev';
    handleExistingContainer(containerName);
    runCommand(commands[command]);
  } else {
    console.error(`Invalid command: ${command}`);
    process.exit(1);
  }
}

main();
