# Use the official Node.js image as a base
FROM arm32v7/node:14

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including devDependencies)
RUN npm install --no-optional

# Install sudo (remove systemd-sysv if not needed)
RUN apt-get update && apt-get install -y sudo

# Add the docker user and give it sudo privileges
RUN useradd -m docker && echo "docker:docker" | chpasswd && adduser docker sudo

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
