## Project useful commands

### Development Environment

##### Local Build

```sh
docker-compose -f docker-compose.dev.yml up --build

```

build with new major changes

```sh
docker-compose -f docker-compose.dev.yml build --no-cache

docker-compose -f docker-compose.dev.yml up

```

##### Production Build

```sh
docker-compose up --build -d

```

##### Upload build to DockerHub

Beagle bone use arm v7 so we use arm version of build

```sh
docker buildx build --platform linux/arm/v7 -t inamdryermaster/beaglebone-app:v1.1 -t inamdryermaster/beaglebone-app:latest --push -f Dockerfile .
```

**Note**
Please don't forget to update these information before you build code above is sample i'm using in development.

```
inamdryermaster=YOUR_DOCKER_USER_NAME
Beaglebone-app=YOUR_DOCKER_REPOSITORY
```
