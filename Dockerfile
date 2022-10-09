FROM node:18-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY dist ./server
COPY package.json ./server/package.json
COPY node_modules ./server/node_modules
COPY client/dist ./client/dist
COPY swagger.json ./server/swagger.json


WORKDIR /app/server

CMD [ "node", "index.js" ]