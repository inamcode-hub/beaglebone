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

# Extract and sort versions numerically, excluding non-numeric tags
LATEST_VERSION=$(echo "$API_RESPONSE" | jq -r '
  .results | 
  map(select(.name != "latest")) | 
  map(select(.name | test("^[0-9]+(\\.[0-9]+)*$"))) | 
  sort_by(.name | split(".") | map(tonumber)) | 
  last | .name
')

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
