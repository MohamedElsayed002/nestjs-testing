# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Expose app port (change if different in main.ts)
EXPOSE 3000

# Run the app
CMD ["npm", "run", "start:dev"]
