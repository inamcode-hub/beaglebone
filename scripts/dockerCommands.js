const path = require('path');
const shell = require('shelljs');
const dotenv = require('dotenv');

// Determine the root directory
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from the appropriate .env file
const envFilePath =
  process.argv[2] === 'runProd' ? '.env.production' : '.env.development';
dotenv.config({ path: path.join(rootDir, envFilePath) });

// Function to quote paths properly for Docker
function quotePath(p) {
  return `"${p.replace(/\\/g, '/')}"`;
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
  runDev: `docker run -p ${process.env.PORT}:${process.env.PORT} --name beaglebone-app-dev --device=/dev/ttyS2 --env-file ${dockerDevEnvFile} -v ${dockerDevVolume} ${dockerDevImage}`,
  buildProd: `docker build --load -t ${dockerProdImage} -f Dockerfile .`,
  runProd: `docker run -d -p ${process.env.PORT}:${process.env.PORT} --name beaglebone-app --device=/dev/ttyS2 --env-file ${dockerProdEnvFile} ${dockerProdImage}`,
};

// Run command
const command = process.argv[2];
if (commands[command]) {
  shell.exec(commands[command]);
} else {
  console.error(`Invalid command: ${command}`);
  process.exit(1);
}
