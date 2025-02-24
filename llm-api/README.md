## to run a container of the LLM ollama API

run the following command in your terminal while youre in this directory
docker-compose up --build -d

## check container terminal to see if the models are downloaded

##or check the volume that is mounted using
docker exec -it ollama ls /root/.ollama/models/blobs

## once models are insalled you can make api calls to it

## TODO

if user interacts with generative AI before the models are downloaded, use the bad response code to return an output like
"please wait until the models are loaded in"
