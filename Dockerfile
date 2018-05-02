FROM mhart/alpine-node:8.9.0

USER root

RUN apk add --no-cache python git curl

RUN npm install -g --unsafe -s yarn
RUN npm install -g --unsafe ts-node
RUN npm install -g --unsafe typescript
RUN npm install -g --unsafe @angular/cli

RUN mkdir -p /app/
WORKDIR /app/
COPY ./package.json /app
COPY ./yarn.lock /app


EXPOSE 4200 4300 4400
