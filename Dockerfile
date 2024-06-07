# pull official base image
FROM node:21.6.2-alpine as build

LABEL org.opencontainers.image.source=https://github.com/MichiganLabs/Hack-the-Lab-Backend

# set working directory
WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

FROM node:21.6.2-alpine AS production

WORKDIR /app

COPY package*.json .

RUN npm ci --omit=dev --ignore-scripts

COPY --from=build /app/dist ./dist

# EXPOSE 8080

CMD ["node", "dist/index.js"]