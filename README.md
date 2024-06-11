# BeagleBone IoT Project

## Overview

This project, developed by Dryermaster Inc., involves setting up BeagleBone IoT devices to communicate with a server, send data, and receive updates. It uses Docker for containerization, Kubernetes for orchestration, and GitHubAction for continuous integration and deployment (CI/CD). The backend server is built with Node.js and Express.js.

## Key Features

- **Real-time Data Communication**: BeagleBone devices send and receive data in real-time.
- **Containerized Deployment**: Uses Docker to ensure consistent environments.
- **Orchestration with Kubernetes**: Manages deployments, scaling, and operations of application containers.
- **CI/CD Pipeline**: Automated testing, building, and deployment using GitHubAction.
- **AWS EKS**: Uses Amazon Elastic Kubernetes Service for scalable and managed Kubernetes.(Not part of this project)

## Architecture

1. **BeagleBone Devices**: IoT devices that collect and send data to the server.
2. **Docker**: Containerizes the application for consistent deployment.
3. **Kubernetes**: Orchestrates the deployment on AWS EKS.(Not part of this project)
4. **GitHubAction**: Manages CI/CD pipeline.
5. **AWS EKS**: Hosts the Kubernetes cluster.

## Getting Started

To get started with the project, follow these steps:

1. **Clone the Repository**

   ```sh
   git clone https://github.com/inamdryermaster/beaglebone.git
   cd beaglebone
   ```

2. **Set Up the Environment**

   - Ensure you have Docker, installed and configured.

3. **Running Locally-production**

   - For instructions on running the project locally, [click here](./docs/project_commands.md#running-locally).

4. **CI/CD Pipeline**
   - Push changes to GitHub to trigger the GitHubAction pipeline for automated build and deployment.

For detailed setup instructions, please refer to the [Github Actions](./docs/github_actions.md) guide.

## Documentation

- [Project Setup Guide](./docs/project_setup.md)
- [API Documentation](./docs/api.md)
- [Contributing Guidelines](./docs/contributing.md)

## Technologies Used

- **Node.js**: JavaScript runtime for server-side development.
- **Express.js**: Web framework for Node.js.
- **Docker**: Platform for containerizing applications.
- **GitHubAction**: Continuous integration and deployment service.

## Contributing

Contributions are welcome! Please see our [contributing guidelines](./docs/contributing.md) for more details.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.

## Contact

For any questions or suggestions, please open an issue or contact Inam Ul Rehman at [inam@dryermaster.com](mailto:inam@dryermaster.com).

---

Thank you for checking out our project! We hope it provides a solid foundation for your IoT applications using BeagleBone, Docker, and AWS.
