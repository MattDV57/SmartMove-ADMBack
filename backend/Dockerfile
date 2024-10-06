# Use an official Node.js image as the base
FROM node:18-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
# Set the working directory within the container
WORKDIR /home/node/app

# Copy package.json and package-lock.json to the working directory
COPY backend/package*.json ./

# Install  
RUN npm install

# Copy the application code to the working directory
COPY --chown=node:node . .

# Set environment variables (replace with your actual values)
#ENV DATABASE_URL="mongodb+srv://SmartMove:awlJ4sZ1PEyBwp6F@adminterna.jxwqb.mongodb.net/AdminInterna?retryWrites=true&w=majority&appName=ADMInterna"

# Expose the application port (adjust if necessary)
EXPOSE 3000

# Define the command to run when the container starts
CMD ["npm", "run", "dev"]
