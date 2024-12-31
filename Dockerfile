# Stage 1: Build Stage
FROM node:18-bullseye-slim AS build

WORKDIR /app

RUN npm install -g @yao-pkg/pkg

COPY ./package.json ./package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Runtime Stage
FROM debian:bullseye-slim

WORKDIR /app

RUN apt-get update && apt-get install -y libstdc++6 && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/binary/notification-service /app/notification-service

CMD ["./notification-service"]
