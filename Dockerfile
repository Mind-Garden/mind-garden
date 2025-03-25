FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i --force

COPY . .

EXPOSE 3000

# Start the app
CMD ["sh", "-c", "npm run build && npm run start"]