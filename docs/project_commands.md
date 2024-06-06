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
