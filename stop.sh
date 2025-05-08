#!/bin/bash

# Function to kill all Node.js processes
kill_all_node_processes() {
  echo "Stopping all Node.js processes..."
  
  # Find all node processes
  local node_pids
  node_pids=$(pgrep node)
  
  if [ -n "$node_pids" ]; then
    echo "Found Node.js processes: $node_pids"
    
    # Kill all node processes
    pkill -9 node
    
    echo "All Node.js processes have been terminated"
  else
    echo "No Node.js processes found running"
  fi
}

# Kill specific port processes first (if needed)
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

# Kill processes on specific ports
kill_process_on_port 3000  # Client port
kill_process_on_port 8000  # Server port

# Kill all Node.js processes
kill_all_node_processes

echo "All processes successfully stopped"
