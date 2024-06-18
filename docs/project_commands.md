# Project Useful Commands

## Development Environment

### Local Build

Build and run the development environment:

```sh
docker build --load -t ${DOCKER_USERNAME}/${DOCKER_REPOSITORY}-dev:latest -f Dockerfile.dev .
docker run -d -p ${PORT}:${PORT} --name beaglebone-app-dev --env-file .env.development ${DOCKER_USERNAME}/${DOCKER_REPOSITORY}-dev:latest
```

Build with new major changes (rebuild without cache):

```sh
docker build --no-cache --load -t ${DOCKER_USERNAME}/${DOCKER_REPOSITORY}-dev:latest -f Dockerfile.dev .
docker run -d -p ${PORT}:${PORT} --name beaglebone-app-dev --env-file .env.development ${DOCKER_USERNAME}/${DOCKER_REPOSITORY}-dev:latest
```

## Production Build

Build and run the production environment:

```sh
docker build --load -t ${DOCKER_USERNAME}/${DOCKER_REPOSITORY}:latest -f Dockerfile .
docker run -d -p ${PORT}:${PORT} --name beaglebone-app --env-file .env.production ${DOCKER_USERNAME}/${DOCKER_REPOSITORY}:latest
```

## Upload Build to DockerHub

BeagleBone uses ARM v7, so we use the ARM version of the build:

```sh
docker buildx build --platform linux/arm/v7 -t ${DOCKER_USERNAME}/${DOCKER_REPOSITORY}:${VERSION} -t ${DOCKER_USERNAME}/${DOCKER_REPOSITORY}:latest --push -f Dockerfile .
```

**Note**
Please don't forget to update these information before you build. Code above is a sample I'm using in development.

```
${DOCKER_USERNAME}=YOUR_DOCKER_USER_NAME
${DOCKER_REPOSITORY}=YOUR_DOCKER_REPOSITORY
```

## Chokidar C/D on beaglebone

```
npm run deploy:watch

```

## Commands in package.json

Your `package.json` file contains several scripts to help with building and running your Docker images. These commands are:

- `docker:build:dev`: Builds the development Docker image.
- `docker:run:dev`: Runs the development Docker image.
- `docker:dev`: Builds and runs the development Docker image.
- `docker:build:prod`: Builds the production Docker image.
- `docker:run:prod`: Runs the production Docker image.
- `docker:prod`: Builds and runs the production Docker image.

### Usage

To build the development Docker image, use:

```sh
npm run docker:build:dev
```

To run the development Docker image, use:

```sh
npm run docker:run:dev
```

To build and run the development Docker image, use:

```sh
npm run docker:dev
```

To build the production Docker image, use:

```sh
npm run docker:build:prod
```

To run the production Docker image, use:

```sh
npm run docker:run:prod
```

To build and run the production Docker image, use:

```sh
npm run docker:prod
```

## Script in dockerCommands.js

The `dockerCommands.js` script is designed to automate the building and running of Docker images for both development and production environments. It uses the `shelljs` and `dotenv` packages to execute commands and manage environment variables.

### Available Commands

- `buildDev`: Builds the development Docker image.
- `runDev`: Runs the development Docker image.
- `buildProd`: Builds the production Docker image.
- `runProd`: Runs the production Docker image.

### Usage

To build the development Docker image:

```sh
node scripts/dockerCommands.js buildDev
```

To run the development Docker image:

```sh
node scripts/dockerCommands.js runDev
```

To build the production Docker image:

```sh
node scripts/dockerCommands.js buildProd
```

To run the production Docker image:

```sh
node scripts/dockerCommands.js runProd
```

Make sure to use these commands according to your needs for development or production environments. This structure helps in maintaining a clean and organized workflow for building and deploying your application.
