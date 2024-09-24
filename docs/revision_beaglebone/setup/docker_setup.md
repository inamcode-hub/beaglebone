# Docker Installation on BeagleBone

## Objective

Install a lightweight version of Docker on the BeagleBone to run Node.js applications efficiently.

## Steps

1. **Remove Old Versions of Docker (if any)**

   If there are any existing Docker installations, remove them first:

   ```bash
   sudo apt-get remove docker docker-engine docker.io containerd runc
   ```

2. **Install Required Dependencies**

   Install required packages that allow `apt` to use packages over HTTPS:

   ```bash
   sudo apt-get update
   sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
   ```

3. **Add Docker’s Official GPG Key**

   Add Docker’s official GPG key for package verification:

   ```bash
   curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
   ```

4. **Set Up the Docker Repository**

   Add Docker’s stable repository for ARM architecture:

   ```bash
   echo "deb [arch=armhf signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   ```

5. **Install Docker CE**

   Update the package index and install Docker:

   ```bash
   sudo apt-get update
   sudo apt-get install -y docker-ce docker-ce-cli containerd.io
   ```

6. **Verify Docker Installation**

   Check if Docker is installed and running:

   ```bash
   sudo systemctl status docker
   ```

   You should see Docker as active and running.

7. **Set Docker to Start on Boot**

   Enable Docker to start automatically on boot:

   ```bash
   sudo systemctl enable docker
   ```

8. **Test Docker by Running a Simple Container**

   Run a test container to verify Docker functionality:

   ```bash
   sudo docker run hello-world
   ```

   This command will pull the `hello-world` image and run it, confirming that Docker is operational.

## Troubleshooting Tips

- If Docker does not start, check the service status and logs:

  ```bash
  sudo systemctl status docker
  sudo journalctl -u docker
  ```

- Ensure all dependencies are correctly installed and the Docker GPG key is up-to-date.

- Restart Docker if needed:

  ```bash
  sudo systemctl restart docker
  ```

## Notes

- This setup is optimized for ARM architecture and should work well with the BeagleBone’s hardware.
- Always monitor Docker updates and ensure your environment remains compatible with the latest Docker versions.
