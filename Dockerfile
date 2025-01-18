FROM node:22-alpine AS build
ENV NODE_ENV=development

WORKDIR /build

## Server
COPY server ./server
RUN cd /build/server && \
    yarn install
RUN cd /build/server && \
    yarn build && \
    yarn swaggergen

## Client
COPY client ./client
RUN cd /build/client && \
    yarn install
RUN cd /build/client && \
    yarn build 

FROM build AS release
ARG VERSION=unknown

LABEL maintainer='www.kubero.dev'
LABEL version=$VERSION

ENV NODE_ENV=production

WORKDIR /app/

COPY --from=build /build/server/dist /app/server
COPY --from=build /build/server/package.json /app/server/package.json
COPY --from=build /build/server/src/modules/templates /app/server/modules/templates
COPY --from=build /build/server/node_modules /app/server/node_modules
COPY --from=build /build/server/swagger.json /app/swagger.json


RUN echo -n $VERSION > /app/server/VERSION

WORKDIR /app/server

CMD [ "node", "index.js" ]