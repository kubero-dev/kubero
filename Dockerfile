FROM node:18-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY dist ./server
COPY package.json ./server/package.json
COPY node_modules ./server/node_modules
RUN mkdir -p /client/dist
COPY client/dist ./client/dist


WORKDIR /app/server

CMD [ "node", "index.js" ]