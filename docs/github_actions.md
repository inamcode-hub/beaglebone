# Setting Up GitHub Actions for CI/CD

This guide will help you set up GitHub Actions to automate the process of building and pushing your Docker image to Docker Hub whenever there is a push to the main branch of your repository.

## 1. Create GitHub Secrets

1. Go to your GitHub repository.
2. Click on `Settings`.
3. Click on `Secrets` in the left sidebar.
4. Click on `New repository secret`.
5. Add the following secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username.
   - `DOCKER_PASSWORD`: Your Docker Hub access token.

## 2. Create the Workflow File

1. In your repository, create the directory `.github/workflows`.
2. Inside the `.github/workflows` directory, create a file named `docker-publish.yml`.

## Example `docker-publish.yml` Workflow

You can find the workflow file [here](../.github/workflows/docker-publish.yml).

## Explanation

- **name**: The name of the workflow.
- **on**: Specifies the event that triggers the workflow. In this case, the workflow is triggered by a push to the `main` branch.
- **jobs**: Contains the jobs that run as part of the workflow.
  - **build**: The job that builds and pushes the Docker image.
    - **runs-on**: Specifies the environment in which the job runs. Here, it runs on the latest version of Ubuntu.
    - **steps**: Contains the steps to run in the job.
      - **Checkout code**: Uses the `actions/checkout@v2` action to check out the repository code.
      - **Set up Docker Buildx**: Uses the `docker/setup-buildx-action@v1` action to set up Docker Buildx.
      - **Log in to Docker Hub**: Logs in to Docker Hub using the username and password stored in the GitHub secrets.
      - **Set up QEMU**: Uses the `docker/setup-qemu-action@v1` action to enable multi-platform builds.
      - **Build and push Docker image**: Builds and pushes the Docker image to Docker Hub.

## Adding the Workflow File to Your Repository

1. **Create the `.github/workflows` Directory**:

   ```sh
   mkdir -p .github/workflows
   ```

2. **Create the Workflow File**:

   ```sh
   nano .github/workflows/docker-publish.yml
   ```

3. **Copy the Workflow YAML into the File**:
   Paste the following content into the `docker-publish.yml` file:
   You can find the workflow file [here](../.github/workflows/docker-publish.yml).

4. **Commit and Push the Workflow File**:
   ```sh
   git add .github/workflows/docker-publish.yml
   git commit -m "Add GitHub Actions workflow for Docker build and push"
   git push origin main
   ```

## Summary

- Create GitHub secrets for your Docker Hub credentials.
- Create a `.github/workflows` directory in your repository.
- Add a workflow file (`docker-publish.yml`) to automate building and pushing your Docker image.
- Commit and push the changes to trigger the workflow.

This setup will ensure that every push to the `main` branch triggers a build and push of your Docker image to Docker Hub using GitHub Actions.
