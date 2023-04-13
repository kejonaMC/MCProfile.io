FROM node:latest

WORKDIR /app

RUN apk add --no-cache git \
  && git clone https://github.com/your-github-username/your-nodejs-repo.git \
  && cd your-nodejs-repo \
  && npm install \
  && npm run build \
  && cp -r build/* /app \
  && cd .. \
  && rm -rf your-nodejs-repo \
  && apk del git

CMD ["npm", "start"]
