# Deployment Guide for BeagleBone IoT Device

## 1. Create Docker Hub Access Token

1. **Log in to Docker Hub**.
2. **Navigate to Settings**:
   - Click on your profile picture in the top right corner, then go to "Account Settings".
3. **Security**:
   - In the sidebar, click on "Security".
4. **New Access Token**:
   - Click "New Access Token".
5. **Generate Token**:
   - Name the token (e.g., `iot-device-access`).
   - Select the necessary scopes (e.g., `read:packages` for read-only access to repositories).
   - Click "Generate" and **copy the token**. This token will not be shown again.

## 2. Install Docker - Set Up the Environment

1. **Install Docker**:

To install Docker, follow the instructions in the [Docker Installation Documentation](https://docs.docker.com/get-docker/).

2. **Create a Secure Directory**:

   ```sh
   mkdir -p ~/docker
   ```

3. **Create and Configure the `.env` File**:

   - Create a file named `.env` in the `~/docker` directory:
     ```sh
     nano ~/docker/.env
     ```
   - Add the following lines to the `.env` file:
     ```ini
     DOCKER_HUB_USERNAME=your_username
     DOCKER_HUB_TOKEN=your_access_token
     DOCKER_REPOSITORY_OWNER=inamdryermaster
     DOCKER_REPOSITORY_NAME=beaglebone-app
     ```
   - Secure the `.env` file:
     ```sh
     chmod 600 ~/docker/.env
     ```

4. **Install Required Packages**:
   - Install `jq` on your BeagleBone:
     ```sh
     sudo apt-get update
     sudo apt-get install jq
     ```

## 3. Create the Deployment Script

1. **Create the Deployment Script**:

   - Create a script named `deploy.sh` in the `~/docker` directory:
     ```sh
     nano ~/docker/deploy.sh
     ```
   - Add the following content to `deploy.sh`:

```sh
#!/bin/bash

# Source the Docker Hub credentials and repository details from the .env file
if [ -f ~/docker/.env ]; then
source ~/docker/.env
else
echo ".env file not found. Exiting."
exit 1
fi

# Print the environment variables for debugging
echo "DOCKER_HUB_USERNAME: $DOCKER_HUB_USERNAME"
echo "DOCKER_HUB_TOKEN: $DOCKER_HUB_TOKEN"
echo "DOCKER_REPOSITORY_OWNER: $DOCKER_REPOSITORY_OWNER"
echo "DOCKER_REPOSITORY_NAME: $DOCKER_REPOSITORY_NAME"

# Check if the required variables are set
if [ -z "$DOCKER_HUB_TOKEN" ] || [ -z "$DOCKER_HUB_USERNAME" ] || [ -z "$DOCKER_REPOSITORY_OWNER" ] || [ -z "$DOCKER_REPOSITORY_NAME" ]; then
echo "One or more required environment variables are not set. Exiting."
exit 1
fi

# Log in to Docker Hub using the access token
echo "Logging in to Docker Hub..."
echo "$DOCKER_HUB_TOKEN" | docker login -u "$DOCKER_HUB_USERNAME" --password-stdin

# Fetch the latest image tag from Docker Hub
echo "Fetching latest image tag from Docker Hub..."
API_RESPONSE=$(curl -s -H "Authorization: Bearer $DOCKER_HUB_TOKEN" "https://hub.docker.com/v2/repositories/$DOCKER_REPOSITORY_OWNER/$DOCKER_REPOSITORY_NAME/tags")
echo "API Response: $API_RESPONSE"

# Check if the API response contains an error
if echo "$API_RESPONSE" | jq -e '.message' >/dev/null; then
echo "Error fetching tags from Docker Hub: $(echo "$API_RESPONSE" | jq -r '.message')"
exit 1
fi

# Extract and sort versions numerically
LATEST_VERSION=$(echo "$API_RESPONSE" | jq -r '.results | map(select(.name != "latest")) | sort_by(.name | split(".") | map(tonumber)) | last.name')
if [ -z "$LATEST_VERSION" ] || [ "$LATEST_VERSION" == "null" ]; then
echo "Failed to fetch the latest version. Exiting."
exit 1
fi

echo "Latest version: $LATEST_VERSION"

# Fetch the current version on the device
if [ -f ~/app/VERSION ]; then
CURRENT_VERSION=$(cat ~/app/VERSION)
else
CURRENT_VERSION="none"
fi

echo "Current version: $CURRENT_VERSION"

# Update to the latest version if necessary
if [ "$LATEST_VERSION" != "$CURRENT_VERSION" ]; then
echo "Updating to the latest version: ${LATEST_VERSION}"
docker pull $DOCKER_REPOSITORY_OWNER/$DOCKER_REPOSITORY_NAME:${LATEST_VERSION}

# Stop and remove the existing container if it exists
if [ "$(docker ps -a -q -f name=$DOCKER_REPOSITORY_NAME)" ]; then
  docker stop $DOCKER_REPOSITORY_NAME || true
  docker rm -f $DOCKER_REPOSITORY_NAME || true
fi

# Run the new container with the repository name as the container name
docker run -d -p 3000:3000 --name $DOCKER_REPOSITORY_NAME $DOCKER_REPOSITORY_OWNER/$DOCKER_REPOSITORY_NAME:${LATEST_VERSION}

# Ensure the directory exists
mkdir -p ~/app

# Write the new version to the VERSION file
echo ${LATEST_VERSION} > ~/app/VERSION

# Clean up old images
docker image prune -af --filter "until=24h"

echo "Deployment complete. Running version: ${LATEST_VERSION}"
else
echo "Already running the latest version: ${CURRENT_VERSION}"
fi
```

# Deployment Script Explanation

This document explains the purpose and functionality of the `deploy.sh` script used to deploy and update the application on the BeagleBone IoT device.

## Overview

The `deploy.sh` script is designed to automate the deployment and update process of a Dockerized application on a BeagleBone device. It achieves this by:

1. Logging into Docker Hub.
2. Fetching the latest version of the application image.
3. Comparing it with the currently running version.
4. Pulling and running the latest version if an update is available.

## Script Breakdown

### 1. Sourcing Environment Variables

```sh
if [ -f ~/docker/.env ]; then
  source ~/docker/.env
else
  echo ".env file not found. Exiting."
  exit 1
fi
```

- The script starts by sourcing environment variables from the `.env` file located in the `~/docker` directory. If the `.env` file is not found, the script exits with an error message.

### 2. Printing Environment Variables

```sh
echo "DOCKER_HUB_USERNAME: $DOCKER_HUB_USERNAME"
echo "DOCKER_HUB_TOKEN: $DOCKER_HUB_TOKEN"
echo "DOCKER_REPOSITORY_OWNER: $DOCKER_REPOSITORY_OWNER"
echo "DOCKER_REPOSITORY_NAME: $DOCKER_REPOSITORY_NAME"
```

- For debugging purposes, the script prints the environment variables to ensure they are correctly sourced.

### 3. Checking Required Variables

```sh
if [ -z "$DOCKER_HUB_TOKEN" ] || [ -z "$DOCKER_HUB_USERNAME" ] || [ -z "$DOCKER_REPOSITORY_OWNER" ] || [ -z "$DOCKER_REPOSITORY_NAME" ]; then
  echo "One or more required environment variables are not set. Exiting."
  exit 1
fi
```

- The script checks if the required environment variables are set. If any of the variables are not set, the script exits with an error message.

### 4. Logging in to Docker Hub

```sh
echo "Logging in to Docker Hub..."
echo "$DOCKER_HUB_TOKEN" | docker login -u "$DOCKER_HUB_USERNAME" --password-stdin
```

- The script logs into Docker Hub using the access token provided in the `.env` file.

### 5. Fetching the Latest Image Tag

```sh
echo "Fetching latest image tag from Docker Hub..."
API_RESPONSE=$(curl -s -H "Authorization: Bearer $DOCKER_HUB_TOKEN" "https://hub.docker.com/v2/repositories/$DOCKER_REPOSITORY_OWNER/$DOCKER_REPOSITORY_NAME/tags")
echo "API Response: $API_RESPONSE"
```

- The script fetches the latest image tag from Docker Hub using the Docker Hub API.

### 6. Checking for API Response Errors

```sh
if echo "$API_RESPONSE" | jq -e '.message' >/dev/null; then
  echo "Error fetching tags from Docker Hub: $(echo "$API_RESPONSE" | jq -r '.message')"
  exit 1
fi
```

- The script checks if the API response contains an error message. If an error is found, the script exits with an error message.

### 7. Extracting the Latest Version

```sh
LATEST_VERSION=$(echo "$API_RESPONSE" | jq -r '.results | map(select(.name != "latest")) | sort_by(.name) | last.name')
if [ -z "$LATEST_VERSION" ] || [ "$LATEST_VERSION" == "null" ]; then
  echo "Failed to fetch the latest version. Exiting."
  exit 1
fi

echo "Latest version: $LATEST_VERSION"
```

- The script extracts the latest version from the API response using `jq`.

### 8. Fetching the Current Version

```sh
if [ -f ~/app/VERSION ]; then
  CURRENT_VERSION=$(cat ~/app/VERSION)
else
  CURRENT_VERSION="none"
fi

echo "Current version: $CURRENT_VERSION"
```

- The script fetches the current version of the application running on the device.

### 9. Updating to the Latest Version

```sh
if [ "$LATEST_VERSION" != "$CURRENT_VERSION" ]; then
  echo "Updating to the latest version: ${LATEST_VERSION}"
  docker pull $DOCKER_REPOSITORY_OWNER/$DOCKER_REPOSITORY_NAME:${LATEST_VERSION}

  if [ "$(docker ps -a -q -f name=$DOCKER_REPOSITORY_NAME)" ]; then
    docker stop $DOCKER_REPOSITORY_NAME || true
    docker rm -f $DOCKER_REPOSITORY_NAME || true
  fi

  docker run -d -p 3000:3000 --name $DOCKER_REPOSITORY_NAME $DOCKER_REPOSITORY_OWNER/$DOCKER_REPOSITORY_NAME:${LATEST_VERSION}

  mkdir -p ~/app
  echo ${LATEST_VERSION} > ~/app/VERSION
  docker image prune -af --filter "until=24h"

  echo "Deployment complete. Running version: ${LATEST_VERSION}"
else
  echo "Already running the latest version: ${CURRENT_VERSION}"
fi
```

- If the latest version is different from the current version, the script updates to the latest version by:
  - Pulling the latest Docker image.
  - Stopping and removing the existing container.
  - Running the new container.
  - Writing the new version to the `VERSION` file.
  - Cleaning up old images.
  - Printing a message indicating that the deployment is complete.

## Conclusion

This script ensures that the BeagleBone IoT device always runs the latest version of the Dockerized application by automating the update process. 2. **Make the Script Executable**:

```sh
chmod +x ~/docker/deploy.sh
```

## 4. Set Up a Cron Job for Automatic Updates

1. **Edit the Crontab**:

   ```sh
   crontab -e
   ```

2. **Add the Cron Job**:
   - Add the following line to schedule the script to run every hour:
     ```sh
     0 * * * * /bin/bash /home/debian/docker/deploy.sh >> /home/debian/docker/deploy.log 2>&1
     ```

## 5. Build and Push the Docker Image

1. **Make Changes to Your Application Code**:

   - Make the necessary changes to your application code in the `src` directory.

2. **Build and Push the Docker Image**:
   - Build and push the Docker image for the ARM architecture:
     `sh
docker buildx build --platform linux/arm/v7 -t inamdryermaster/beaglebone-app:v1.1 -t inamdryermaster/beaglebone-app:latest --push -f Dockerfile .
`
     **Note**
     Please Update build command

```
inamdryermaster=YOUR_DOCKER_USERNAME
BEAGLEBONE-APP=YOUR_DOCKER_REPOSITORY
```

## 6. Monitor Deployment and Verify Updates

1. **Monitor Deployment Logs**:

   - Use the `tail` command to monitor the logs in real-time:
     ```sh
     tail -f /home/debian/docker/deploy.log
     ```

2. **Verify the Running Container**:
   - Check if the new container is running:
     ```sh
     docker ps
     ```

## Summary of Commands

### On Development Machine

1. **Build and Push the Docker Image**:
   ```sh
   docker buildx build --platform linux/arm/v7 -t inamdryermaster/beaglebone-app:v1.1 -t inamdryermaster/beaglebone-app:latest --push -f Dockerfile .
   ```

### On BeagleBone

1. **Create and Configure Environment**:

   ```sh
   mkdir -p ~/docker
   nano ~/docker/.env
   chmod 600 ~/docker/.env
   sudo apt-get update
   sudo apt-get install jq
   ```

2. **Create Deployment Script**:

   ```sh
   nano ~/docker/deploy.sh
   chmod +x ~/docker/deploy.sh
   ```

3. **Set Up Cron Job**:

   ```sh
   crontab -e
   ```

   Add the cron job:

   ```sh
   0 * * * * /bin/bash /home/debian/docker/deploy.sh >> /home/debian/docker/deploy.log 2>&1
   ```

4. **Monitor Deployment Logs**:

   ```sh
   tail -f /home/debian/docker/deploy.log
   ```

5. **Verify Running Container**:
   ```sh
   docker ps
   ```
