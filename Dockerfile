FROM node:25

WORKDIR /app

COPY package*.json tsconfig*.json ./
RUN npm install

COPY . .

# TypeScript to Javascript
RUN npx tsc

EXPOSE 3001
EXPOSE 4000