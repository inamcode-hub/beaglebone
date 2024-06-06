# IoT Project Setup with Docker, GitHub, and GitHub Actions

## Overview

This document outlines the setup for our IoT project using Docker, BeagleBone, GitHub, and GitHub Actions. The project involves continuous deployment of an Express.js application to BeagleBone devices.

## Tools and Services

1. **GitHub**: For version control and collaboration.
2. **Docker**: To containerize the application.
3. **Docker Hub**: To store and manage Docker images.
4. **GitHub Actions**: For continuous integration and continuous deployment (CI/CD).
5. **BeagleBone**: IoT devices where the application will be deployed.

## Accounts and Credentials

### GitHub

- **Username**: `your-github-username`
- **Password**: `your-github-password`
- **Repository**: `https://github.com/yourusername/your-repo-name`

### Docker Hub

- **Username**: `your-dockerhub-username`
- **Password**: `your-dockerhub-password`
- **Repository**: `your-dockerhub-username/your-repo-name`

### BeagleBone

- **SSH Username**: `your-beaglebone-username`
- **SSH Password**: `your-beaglebone-password`
- **Host**: `your-beaglebone-ip-address`

## Project Setup

### 1. Setting Up the Express.js Application

Create a simple Express.js application.

**index.js:**

```javascript
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Server is listening'));

app.listen(port, () => console.log(`Server is listening on port ${port}`));
```

**package.json:**

```json
{
  "name": "my-express-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.17.1"
  }
}
```

### 2. Dockerize the Application

Create a Dockerfile to containerize the Express.js application.

**Dockerfile:**

```dockerfile
FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### 3. Push Code to GitHub

Initialize a Git repository and push your code to GitHub.

```sh
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

### 4. Configure GitHub Actions

Create a `.github/workflows` directory and add a workflow file for GitHub Actions.

1. **Create the `.github/workflows` Directory**:

   ```sh
   mkdir -p .github/workflows
   ```

2. **Create the Workflow File**:

   ```sh
   nano .github/workflows/docker-publish.yml
   ```

3. **Copy the Workflow YAML into the File**:

   ```yaml
   name: CI/CD Pipeline

   on:
     push:
       branches:
         - main

   jobs:
     build:
       runs-on: ubuntu-latest

       steps:
         - name: Checkout code
           uses: actions/checkout@v2

         - name: Set up Docker Buildx
           uses: docker/setup-buildx-action@v1

         - name: Log in to Docker Hub
           run: echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin

         - name: Set up QEMU
           uses: docker/setup-qemu-action@v1

         - name: Build and push Docker image
           run: |
             docker buildx build --platform linux/arm/v7 -t inamdryermaster/beaglebone-app:latest --push -f Dockerfile .
   ```

4. **Commit and Push the Workflow File**:
   ```sh
   git add .github/workflows/docker-publish.yml
   git commit -m "Add GitHub Actions workflow for Docker build and push"
   git push origin main
   ```

### 5. Set Up BeagleBone

1. **Install Docker:** Follow the installation steps for Docker on your BeagleBone.

2. **Configure Deployment Script on BeagleBone:**

Create a deployment script to pull and run the latest Docker image on your BeagleBone.

**deploy.sh:**

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

### 6. Environment Variables in GitHub Actions

In GitHub repository settings, configure the following environment variables:

- DOCKER_USERNAME: Your Docker Hub username.
- DOCKER_PASSWORD: Your Docker Hub password.

### 7. Automating Updates

With this setup, any changes pushed to the GitHub repository will automatically trigger the GitHub Actions workflow. The workflow will build and push the Docker image, and the BeagleBone device will pull the latest image and run it.

### Security Best Practices

- **Use Environment Variables:** Never hardcode sensitive information in your code or configuration files. Use environment variables.
- **Restrict Access:** Use IAM roles and policies to restrict access to your AWS resources.
- **Monitor and Log:** Monitor your deployments and log any unusual activity.
- **Regular Updates:** Keep your dependencies and tools updated to mitigate security vulnerabilities.
