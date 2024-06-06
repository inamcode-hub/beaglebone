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
     ```sh
     export DOCKER_HUB_USERNAME="your_username"
     export DOCKER_HUB_TOKEN="your_access_token"
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

     # Load Docker Hub credentials from the .env file
     source ~/docker/.env

     # Log in to Docker Hub using the access token
     echo "$DOCKER_HUB_TOKEN" | docker login -u "$DOCKER_HUB_USERNAME" --password-stdin

     # Fetch the latest image digest from Docker Hub
     LATEST_DIGEST=$(curl -s -H "Authorization: Bearer $DOCKER_HUB_TOKEN" "https://hub.docker.com/v2/repositories/inamdryermaster/beaglebone-app/tags/latest/" | jq -r '.images[0].digest')

     # Fetch the current image digest on the device
     CURRENT_DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' inamdryermaster/beaglebone-app:latest | grep -oP '(?<=sha256:)[a-f0-9]+')

     # Compare the digests and update the image if they differ
     if [ "$LATEST_DIGEST" != "$CURRENT_DIGEST" ]; then
       echo "New image found, updating..."
       docker pull inamdryermaster/beaglebone-app:latest
       docker stop beaglebone-app || true
       docker rm beaglebone-app || true
       docker run -d -p 3000:3000 --name beaglebone-app inamdryermaster/beaglebone-app:latest
     else
       echo "No new image found, skipping update."
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
   - Add the following line to schedule the script to run every 5 minutes:
     ```sh
     */5 * * * * /bin/bash /home/debian/docker/deploy.sh >> /home/debian/docker/deploy.log 2>&1
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
   */5 * * * * /bin/bash /home/debian/docker/deploy.sh >> /home/debian/docker/deploy.log 2>&1
   ```

4. **Monitor Deployment Logs**:

   ```sh
   tail -f /home/debian/docker/deploy.log
   ```

5. **Verify Running Container**:
   ```sh
   docker ps
   ```
