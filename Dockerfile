# Use an official Node.js image as the base
FROM node:18-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
# Set the working directory within the container
WORKDIR /home/node/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./


# Install  
RUN npm install

# Copy the application code to the working directory
COPY --chown=node:node . .

# Definimos los argumentos
ARG ACCESS_TOKEN_SECRET
ARG LDAP_ADMIN_DN
ARG LDAP_ADMIN_PASSWORD
ARG LDAP_URL
ARG MONGO_CONNECTION_STRING2
ARG PORT
ARG REFRES_TOKEN_SECRET
ARG WHATSAPP_PHONE_ID
ARG WHATSAPP_TOKEN
ARG WHATSAPP_VERIFY_TOKEN
ARG DATABASE_URL
ARG DOCKER_PASSWORD
ARG DOCKER_USER


# Configuramos las variables de entorno
ENV ACCESS_TOKEN_SECRET=$ACCESS_TOKEN_SECRET
ENV LDAP_ADMIN_DN=$LDAP_ADMIN_DN
ENV LDAP_ADMIN_PASSWORD=$LDAP_ADMIN_PASSWORD
ENV LDAP_URL=$LDAP_URL
ENV MONGO_CONNECTION_STRING2=$MONGO_CONNECTION_STRING2
ENV PORT=$PORT
ENV REFRES_TOKEN_SECRET=$REFRES_TOKEN_SECRET
ENV WHATSAPP_PHONE_ID=$WHATSAPP_PHONE_ID
ENV WHATSAPP_TOKEN=$WHATSAPP_TOKEN
ENV WHATSAPP_VERIFY_TOKEN=$WHATSAPP_VERIFY_TOKEN
ENV DATABASE_URL=$DATABASE_URL
ENV DOCKER_PASSWORD=$DOCKER_PASSWORD
ENV DOCKER_USER=$DOCKER_USER

# Set environment variables (replace with your actual values)
#ENV DATABASE_URL="mongodb+srv://SmartMove:awlJ4sZ1PEyBwp6F@adminterna.jxwqb.mongodb.net/AdminInterna?retryWrites=true&w=majority&appName=ADMInterna"

# Expose the application port (adjust if necessary)
EXPOSE 3000

# Define the command to run when the container starts
CMD ["npm", "run", "dev"]

