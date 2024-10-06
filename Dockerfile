# Use an official Node.js image as the base
FROM node:18-alpine

# Set the working directory within the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install  
RUN npm install

# Copy the application code to the working directory
COPY   
 . .

# Set environment variables (replace with your actual values)
ENV DATABASE_URL="mongodb+srv://SmartMove:awlJ4sZ1PEyBwp6F@adminterna.jxwqb.mongodb.net/AdminInterna?retryWrites=true&w=majority&appName=ADMInterna"

# Expose the application port (adjust if necessary)
EXPOSE 3000

# Define the command to run when the container starts
CMD ["npm", "run", "dev"]
