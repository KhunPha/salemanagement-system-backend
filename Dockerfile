FROM node:14-slim
WORKDIR /app
COPY . .
RUN npm install --force
EXPOSE 8080
CMD ["npm","run", "dev"]