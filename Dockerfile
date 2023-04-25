FROM node:latest
WORKDIR /app/gfapi-website
COPY package*.json ./
RUN npm install
COPY --from=build /app/gfapi-website/dist /app/gfapi-website
EXPOSE 8888
CMD [ "npm", "start" ]