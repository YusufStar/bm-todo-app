#!/bin/bash

# Function to kill processes running on a specific port
kill_process_on_port() {
  local port=$1
  local pid
  pid=$(lsof -t -i :$port)
  if [ -n "$pid" ]; then
    echo "Killing process on port $port (PID: $pid)"
    kill -9 $pid
  else
    echo "No process running on port $port"
  fi
}

# Kill processes on ports 3000 and 8000
kill_process_on_port 3000
kill_process_on_port 8000

# Navigate to the server directory and start the development server
cd server || { echo "Server directory not found"; exit 1; }
npm run build && npm run start &

# Navigate to the client directory and start the development server
cd ../client || { echo "Client directory not found"; exit 1; }
npm run dev &