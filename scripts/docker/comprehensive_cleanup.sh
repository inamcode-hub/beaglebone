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

# Comprehensive cleanup
docker system prune -a -f --volumes

echo "Docker cleanup completed. All unused containers, images, volumes, and networks have been removed."
