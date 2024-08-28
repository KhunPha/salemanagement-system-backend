FROM node:14-slim
WORKDIR /app
COPY . .
RUN npm install
RUN apt-get update && \
    apt-get install -y wget && \
    wget -qO mongodb-tools.deb https://fastdl.mongodb.org/tools/db/mongodb-database-tools-debian11-x86_64-100.6.0.deb && \
    dpkg -i mongodb-tools.deb || apt-get install -f -y && \
    apt-get clean && rm -rf /var/lib/apt/lists/* mongodb-tools.deb
EXPOSE 8080
CMD ["npm","run", "dev"]

# FROM node:14-slim
# WORKDIR /usr/src/app
# COPY . .
# RUN npm install
# EXPOSE 8080
# CMD ["npm", "run", "dev"]