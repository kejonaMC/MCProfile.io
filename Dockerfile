FROM node:latest

WORKDIR /home/node

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8888

CMD ["node", "build/app.js"]
