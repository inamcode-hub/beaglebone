# IoT Project Setup with Docker, Kubernetes, GitHub, CircleCI, and AWS

## Overview

This document outlines the setup for our IoT project using Docker, Kubernetes, BeagleBone, GitHub, CircleCI, and AWS. The project involves continuous deployment of an Express.js application to BeagleBone devices.

## Tools and Services

1. **GitHub**: For version control and collaboration.
2. **Docker**: To containerize the application.
3. **Docker Hub**: To store and manage Docker images.
4. **CircleCI**: For continuous integration and continuous deployment (CI/CD).
5. **Kubernetes (K8s)**: For automating deployment, scaling, and management of containerized applications.
6. **AWS**: To host the Kubernetes cluster using Amazon EKS (Elastic Kubernetes Service).
7. **BeagleBone**: IoT devices where the application will be deployed.

## Accounts and Credentials

### GitHub

- **Username**: `your-github-username`
- **Password**: `your-github-password`
- **Repository**: `https://github.com/yourusername/your-repo-name`

### Docker Hub

- **Username**: `your-dockerhub-username`
- **Password**: `your-dockerhub-password`
- **Repository**: `your-dockerhub-username/your-repo-name`

### CircleCI

- **Username**: `your-circleci-username`
- **Password**: `your-circleci-password`

### AWS

- **Access Key ID**: `your-aws-access-key-id`
- **Secret Access Key**: `your-aws-secret-access-key`
- **EKS Cluster Name**: `your-eks-cluster-name`
- **Region**: `your-aws-region`

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

```yml
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

### 5. Configure CircleCI

Create a .circleci/config.yml file for CircleCI.

**.circleci/config.yml**

```yml
version: 2.1

jobs:
  build:
    docker:
      - image: circleci/node:14

    steps:
      - checkout
      - setup_remote_docker
      - run:
          name: Install Docker Compose
          command: |
            curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
      - run:
          name: Build Docker Image
          command: docker build -t your-dockerhub-username/your-repo-name .
      - run:
          name: Test Docker Image
          command: docker run -d -p 3000:3000 your-dockerhub-username/your-repo-name
      - run:
          name: Run Tests
          command: |
            sleep 10
            curl -f http://localhost:3000

  deploy:
    docker:
      - image: circleci/node:14

    steps:
      - setup_remote_docker
      - run:
          name: Docker Login
          command: docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
      - run:
          name: Build and Push Docker Image
          command: |
            docker build -t $DOCKER_USERNAME/your-repo-name:latest .
            docker push $DOCKER_USERNAME/your-repo-name:latest
      - run:
          name: Deploy to Kubernetes
          command: |
            aws eks --region $AWS_REGION update-kubeconfig --name $KUBERNETES_CLUSTER_NAME
            kubectl set image deployment/your-repo-name your-repo-name=$DOCKER_USERNAME/your-repo-name:latest --record

workflows:
  version: 2
  build_and_deploy:
    jobs:
      - build
      - deploy:
          requires:
            - build
```

### 6. Set Up Kubernetes on AWS EKS

1. Create EKS Cluster: Follow the AWS EKS documentation to create a Kubernetes cluster.

2. Configure kubectl: Use `aws eks update-kubeconfig` to configure `kubectl` for your EKS cluster.

### 7. Deploy Kubernetes Configuration

- Create a Kubernetes deployment file:

**k8s-deployment.yml:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-express-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-express-app
  template:
    metadata:
      labels:
        app: my-express-app
    spec:
      containers:
        - name: my-express-app
          image: your-dockerhub-username/your-repo-name:latest
          ports:
            - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: my-express-app
spec:
  type: NodePort
  ports:
    - port: 3000
      targetPort: 3000
      nodePort: 30001
  selector:
    app: my-express-app
```

Apply the deployment to your Kubernetes cluster.

```sh
kubectl apply -f k8s-deployment.yml
```

## 8. Set Up BeagleBone

1. **Install Docker:** Follow the installation steps for Docker on your BeagleBone.
2. **Install K3s:** Follow the installation steps for K3s on your BeagleBone.
3. **Join EKS Cluster:** Ensure your BeagleBone devices join your EKS cluster.

## 9. Environment Variables in CircleCI

In CircleCI project settings, configure the following environment variables:

- DOCKER_USERNAME: Your Docker Hub username.
- DOCKER_PASSWORD: Your Docker Hub password.
- AWS_REGION: Your AWS region.
- AWS_ACCESS_KEY_ID: Your AWS access key ID.
- AWS_SECRET_ACCESS_KEY: Your AWS secret access key.
- KUBERNETES_CLUSTER_NAME: Your EKS cluster name.

## 10. Automating Updates

With this setup, any changes pushed to the GitHub repository will automatically trigger the CircleCI pipeline. The pipeline will build and push the Docker image, and update the Kubernetes deployment, which will then propagate the changes to all connected IoT devices (BeagleBone).

## Security Best Practices

- **Use Environment Variables:** Never hardcode sensitive information in your code or configuration files. Use environment variables.
- **Restrict Access:** Use IAM roles and policies to restrict access to your AWS resources.
- **Monitor and Log:** Monitor your deployments and log any unusual activity.
- **Regular Updates:** Keep your dependencies and tools updated to mitigate security vulnerabilities.
