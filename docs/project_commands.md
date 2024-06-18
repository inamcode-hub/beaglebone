## Project Useful Commands

### Development Environment

#### Local Build

Build and run the development environment:

```sh
docker build --load -t inamdryermaster/beaglebone-app-dev:latest -f Dockerfile.dev .
docker run -d -p 3000:3000 --name beaglebone-app-dev --env-file .env.development inamdryermaster/beaglebone-app-dev:latest
```

Build with new major changes (rebuild without cache):

```sh
docker build --no-cache --load -t inamdryermaster/beaglebone-app-dev:latest -f Dockerfile.dev .
docker run -d -p 3000:3000 --name beaglebone-app-dev --env-file .env.development inamdryermaster/beaglebone-app-dev:latest
```

#### Production Build

Build and run the production environment:

```sh
docker build --load -t inamdryermaster/beaglebone-app:latest -f Dockerfile .
docker run -d -p 3000:3000 --name beaglebone-app --env-file .env.production inamdryermaster/beaglebone-app:latest
```

#### Upload Build to DockerHub

BeagleBone uses ARM v7, so we use the ARM version of the build:

```sh
docker buildx build --platform linux/arm/v7 -t inamdryermaster/beaglebone-app:v1.1 -t inamdryermaster/beaglebone-app:latest --push -f Dockerfile .
```

**Note**
Please don't forget to update these information before you build. Code above is a sample I'm using in development.

```
inamdryermaster=YOUR_DOCKER_USER_NAME
beaglebone-app=YOUR_DOCKER_REPOSITORY
```
