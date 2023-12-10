# Use the official Node.js image as the base image
FROM node:current-alpine

# Set the working directory inside the container
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy the package.json and pnpm-lock.yaml files to the working directory
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install the dependencies
RUN pnpm install

# Copy the rest of the application code to the working directory
COPY . .

# Set the environment variable for the port number
ENV PORT=50001

# Set the entrypoint command
ENTRYPOINT [ "node", "index.js", "start", "--port", "$PORT" ]
