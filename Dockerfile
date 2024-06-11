# Use the official Node.js 14 image
FROM node:14

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY src/package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY src ./

# Copy the version file from the root directory
COPY VERSION /usr/src/app/VERSION

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "index.js"]
