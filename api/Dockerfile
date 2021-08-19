# Cf. https://dockerize.io/guides/node-express-guide
FROM node:16

WORKDIR /usr/src/app

# COPY package*.json ./
COPY package*.json ./
COPY rollup.config.js ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080
CMD [ "npm", "start" ]