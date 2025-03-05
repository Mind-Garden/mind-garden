FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i --force

COPY . .

EXPOSE 3000

ENV NEXT_PUBLIC_SUPABASE_URL=https://uzopmmdrusvzjbleuyre.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6b3BtbWRydXN2empibGV1eXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2MDk5MDYsImV4cCI6MjA1MzE4NTkwNn0.hI10gJYa4aBOtwaeIRS8g-dGDRQV7GvX48s6mQtRav0

# Start the app
CMD ["npm", "run", "dev"]
