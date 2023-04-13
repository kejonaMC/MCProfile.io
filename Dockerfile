FROM node:latest

WORKDIR /app

RUN apk update && apk add --no-cache git \
  && git clone https://github.com/kejonaMC/gfapi-website.git \
  && cd gfapi-website \
  && npm install \
  && npm run build \
  && cp -r build/* /app \
  && cd .. \
  && rm -rf gfapi-website \
  && apk del git

CMD ["npm", "start"]





