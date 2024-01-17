ARG VERSION=2.0.0
FROM node:21-alpine AS build
ENV NODE_ENV=development

WORKDIR /build

COPY server ./server
RUN cd server && \
    yarn install && \
    npm run build && \
    yarn swaggergen && \
    cd ..
COPY client ./client
RUN cd client && \
    yarn install && \
    yarn build && \
    cd ..

FROM build AS release

LABEL maintainer='www.kubero.dev'
LABEL version=$VERSION

ENV NODE_ENV=production

WORKDIR /app/

COPY --from=build /build/server/dist /app/server
COPY --from=build /build/server/package.json /app/server/package.json
COPY --from=build /build/server/node_modules /app/server/node_modules
COPY --from=build /build/server/swagger.json /app/swagger.json


RUN echo $VERSION > VERSION

WORKDIR /app/server

CMD [ "node", "index.js" ]