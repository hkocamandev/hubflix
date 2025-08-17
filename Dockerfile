FROM node:18

WORKDIR /app

COPY package*.json tsconfig*.json ./
RUN npm install

COPY . .

EXPOSE 3001
EXPOSE 4000