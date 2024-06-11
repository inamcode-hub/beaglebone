### How to install Docker on debian

#### Step 1: Update System Packages

First, update the existing list of packages:

```sh
sudo apt-get update
```

#### Step 2: Install Prerequisites

Install the necessary prerequisites for Docker:

```sh
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

#### Step 3: Add Docker’s Official GPG Key

Add Docker’s official GPG key:

```sh
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

```

#### Step 4: Set Up the Docker Repository

Add the Docker APT repository:

```sh
echo "deb [arch=armhf signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

```

#### Step 5: Update Package List Again

Update the package list to include the Docker packages from the newly added repo:

```sh
sudo apt-get update

```

#### Step 6: Install Docker Engine

Install Docker:

```sh
sudo apt-get install docker-ce docker-ce-cli containerd.io

```

#### Step 7: Verify Docker Installation

Verify that Docker is installed correctly by running:

```sh
sudo docker run hello-world

```

#### Optional Step: Manage Docker as a Non-Root User

To avoid typing sudo whenever you run the docker command, add your user to the docker group:

```sh
sudo usermod -aG docker $USER

```

After adding your user to the docker group, you need to log out and log back in for this change to take effect. You can check the addition by running:

```sh
groups $USER

```

#### Step 8: Enable Docker to Start at Boot

To ensure Docker starts automatically at boot, enable the Docker service:

```sh
sudo systemctl enable docker

```

### Summary of Commands

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
