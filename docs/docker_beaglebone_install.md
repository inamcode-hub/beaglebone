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
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=armhf signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
sudo docker run hello-world
sudo usermod -aG docker $USER
sudo systemctl enable docker
```
