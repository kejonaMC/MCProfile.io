FROM node:latest
WORKDIR /app/gfapi-website
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]




