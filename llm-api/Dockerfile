# Use the official Ollama image as the base
FROM ollama/ollama

# Install dos2unix (for Debian/Ubuntu-based images)
RUN apt-get update && apt-get install -y dos2unix && rm -rf /var/lib/apt/lists/*

# Copy ModelFile
COPY Modelfile /Modelfile

# Copy an entrypoint script into the image
COPY entrypoint.sh /entrypoint.sh

# Convert entrypoint.sh to LF and make it executable
RUN dos2unix /entrypoint.sh && chmod +x /entrypoint.sh

# Set the entrypoint to our script
ENTRYPOINT ["/entrypoint.sh"]