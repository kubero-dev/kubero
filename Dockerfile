FROM node:22-alpine AS build
ENV NODE_ENV=development

WORKDIR /build

## Server
COPY server ./server
RUN cd /build/server && \
    yarn install
RUN cd /build/server && \
    yarn build

## Client
COPY client ./client
RUN cd /build/client && \
    yarn install
RUN cd /build/client && \
    yarn build 

FROM node:22-alpine AS release
ARG VERSION=unknown

LABEL maintainer='www.kubero.dev'
LABEL version=$VERSION

ENV NODE_ENV=production

WORKDIR /app/

COPY --from=build /build/server/dist /app/server
COPY --from=build /build/server/package.json /app/server/package.json
COPY --from=build /build/server/src/deployments/templates /app/server/deployments/templates
COPY --from=build /build/server/node_modules /app/server/node_modules

# temporary fix for the public folder
COPY --from=build /build/server/dist/public /app/server/public


RUN echo -n $VERSION > /app/server/VERSION

WORKDIR /app/server

CMD [ "node", "main" ]