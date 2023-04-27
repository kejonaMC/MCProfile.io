FROM node:latest
WORKDIR /app
COPY package*.json .
COPY . ./
RUN npm install
EXPOSE 8888
CMD [ "npm", "start" ]