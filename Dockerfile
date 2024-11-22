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
ARG API_KEY
ARG LDAP_ADMIN_DN
ARG LDAP_ADMIN_PASSWORD
ARG LDAP_URL
ARG MONGO_CONNECTION_STRING
ARG PORT
ARG REFRES_TOKEN_SECRET
ARG WHATSAPP_PHONE_ID
ARG WHATSAPP_TOKEN
ARG WHATSAPP_VERIFY_TOKEN
ARG DATABASE_URL
ARG DOCKER_PASSWORD
ARG DOCKER_USER
ARG TEST_PHONE_NUMBER
ARG LDAP_URL_SECURE
ARG LDAP_DN
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG EVENT_BUS_ARN
ARG SQS_URL
ARG SQS_ARN


# Configuramos las variables de entorno
ENV ACCESS_TOKEN_SECRET=$ACCESS_TOKEN_SECRET
ENV API_KEY=$API_KEY
ENV LDAP_ADMIN_DN=$LDAP_ADMIN_DN
ENV LDAP_ADMIN_PASSWORD=$LDAP_ADMIN_PASSWORD
ENV LDAP_URL=$LDAP_URL
ENV MONGO_CONNECTION_STRING=$MONGO_CONNECTION_STRING
ENV PORT=$PORT
ENV REFRES_TOKEN_SECRET=$REFRES_TOKEN_SECRET
ENV WHATSAPP_PHONE_ID=$WHATSAPP_PHONE_ID
ENV WHATSAPP_TOKEN=$WHATSAPP_TOKEN
ENV WHATSAPP_VERIFY_TOKEN=$WHATSAPP_VERIFY_TOKEN
ENV DATABASE_URL=$DATABASE_URL
ENV DOCKER_PASSWORD=$DOCKER_PASSWORD
ENV DOCKER_USER=$DOCKER_USER
ENV TEST_PHONE_NUMBER=$TEST_PHONE_NUMBER
ENV LDAP_URL_SECURE=$LDAP_URL_SECURE
ENV LDAP_DN=$LDAP_DN
ENV AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
ENV EVENT_BUS_ARN=$EVENT_BUS_ARN
ENV SQS_URL=$SQS_URL
ENV SQS_ARN=$SQS_ARN

# Set environment variables (replace with your actual values)
#ENV DATABASE_URL="mongodb+srv://SmartMove:awlJ4sZ1PEyBwp6F@adminterna.jxwqb.mongodb.net/AdminInterna?retryWrites=true&w=majority&appName=ADMInterna"

# Expose the application port (adjust if necessary)
EXPOSE 3000

# Define the command to run when the container starts
CMD ["npm", "run", "dev"]

