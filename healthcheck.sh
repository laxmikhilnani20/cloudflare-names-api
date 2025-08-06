#!/bin/sh

# Simple health check script that can be used in Docker environments
# to verify the Worker API is responding correctly

echo "Checking if the worker API is up and running..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8787/)

if [ "$response" = "200" ]; then
    echo "Worker API is up and running! (HTTP 200)"
    exit 0
else
    echo "Worker API is not responding correctly. Received HTTP $response"
    exit 1
fi
