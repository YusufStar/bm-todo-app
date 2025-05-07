#!/bin/bash

# Navigate to the server directory and start the development server
cd server || { echo "Server directory not found"; exit 1; }
npm run dev &

# Navigate to the client directory and start the development server
cd ../client || { echo "Client directory not found"; exit 1; }
npm run dev &