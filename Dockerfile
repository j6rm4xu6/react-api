FROM node:14.17.3-buster as build
WORKDIR /app
COPY package.json package.json
RUN npm install
COPY . .
RUN npm run build


FROM nginx:1.12-alpine as nginx_server
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


FROM node:14.17.3-buster as api-server
WORKDIR /app
COPY /api .
RUN npm install
EXPOSE 9988
CMD ["node", "index.js"]