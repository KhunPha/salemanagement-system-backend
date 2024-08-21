# FROM node:14-slim
# WORKDIR /app
# COPY . .
# RUN npm install
# EXPOSE 8080
# CMD ["npm","run", "dev"]

FROM node:14-slim
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 8080
CMD ["npm", "run", "dev"]