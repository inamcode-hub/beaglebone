# Use the official Node.js image as a base
FROM node:14

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including devDependencies)
RUN npm install

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3000

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["npm", "run", "dev"]
