#!/bin/bash

# Stop all running containers
if [ "$(docker ps -a -q)" ]; then
  docker stop $(docker ps -a -q)
fi

# Remove all containers
if [ "$(docker ps -a -q)" ]; then
  docker rm $(docker ps -a -q)
fi

# Remove all images
if [ "$(docker images -q)" ]; then
  docker rmi $(docker images -q)
fi

# Remove all unused volumes
docker volume prune -f

# Remove all unused networks
docker network prune -f

# Remove all build cache
docker builder prune -a -f

# Comprehensive cleanup
docker system prune -a -f --volumes

echo "Docker cleanup completed. All unused containers, images, volumes, networks, and cache have been removed."
