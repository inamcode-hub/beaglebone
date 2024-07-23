#!/bin/bash

# Stop all running containers
docker stop $(docker ps -a -q)

# Remove all containers
docker rm $(docker ps -a -q)

# Remove all images
docker rmi $(docker images -q)

# Remove all unused volumes
docker volume prune -f

# Remove all unused networks
docker network prune -f

# Remove all build cache
docker builder prune -a -f

# Comprehensive cleanup
docker system prune -a -f --volumes

echo "Docker cleanup completed. All unused containers, images, volumes, networks, and cache have been removed."
