# Use an official Node.js runtime as a parent image (choose your desired version)
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Install system dependencies including poppler-utils
# apt-get update MUST be run in the same RUN command as apt-get install
RUN apt-get update && apt-get install -y --no-install-recommends \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json (or yarn.lock)
# Copy these first to leverage Docker cache for dependencies
COPY package*.json ./

# Install app dependencies
RUN npm install --omit=dev --no-optional && npm cache clean --force

# Bundle app source inside Docker image
COPY . .

# Make port 5000 available to the world outside this container (adjust if your app uses a different port)
EXPOSE 5000

# Define environment variable (optional, can also be set in Render UI)
# ENV NODE_ENV=production

# Define the command to run your app
CMD [ "node", "server.js" ]
