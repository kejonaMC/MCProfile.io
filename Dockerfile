FROM node:latest
WORKDIR /app/gfapi-website
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8888
CMD [ "npm", "start" ]