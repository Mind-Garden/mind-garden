#!/bin/bash 
set -e

echo "Starting Ollama server in background..."
/bin/ollama serve &

# Capture the PID so we can wait on it later
SERVER_PID=$!

# Wait until the server is up
echo "Waiting for Ollama server to become available..."
sleep 5

# check if model is available, if not pull it
echo "Checking if model 'llama3.2:1b' is available..."
if /bin/ollama list | grep -q "llama3.2:1b"; then
    echo "Model 'llama3.2:1b' is already available."
else
    echo "Model 'llama3.2:1b' is not available. Pulling the model..."
    /bin/ollama run llama3.2:1b
fi

# check if custom model is available, if not create it
echo "Creating custom model from 'llama3.2:1b'called summarization model..."
if /bin/ollama list | grep -q "summarization-model"; then
    echo "Model summarization-model is already available."
else
    echo "Model summarization-model is not available. Creating the model..."
    /bin/ollama create summarization-model -f Modelfile
fi

echo "Ollama server and model setup complete. Server logs follow..."
# Wait on the Ollama server process so the container keeps running
wait $SERVER_PID
