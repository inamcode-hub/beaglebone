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

## 2. Set Up the Environment on BeagleBone

1. **Create a Secure Directory**:

   ```sh
   mkdir -p ~/docker
   ```

2. **Create and Configure the `.env` File**:

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

3. **Install Required Packages**:
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

     # Extract the latest version from the API response
     LATEST_VERSION=$(echo "$API_RESPONSE" | jq -r '.results | map(select(.name != "latest")) | sort_by(.name) | last.name')
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

2. **Make the Script Executable**:
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
     ```sh
     docker buildx build --platform linux/arm/v7 -t inamdryermaster/beaglebone-app:v1.1 -t inamdryermaster/beaglebone-app:latest --push -f Dockerfile .
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
