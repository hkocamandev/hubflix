FROM node:18

WORKDIR /app

# package.json ve tsconfig.json dosyalarını kopyala
COPY package*.json tsconfig*.json ./
RUN npm install

# tüm kodu kopyala
COPY . .

# portları expose et
EXPOSE 3001 4000

# iki server.ts'i aynı anda ayağa kaldırmak için entrypoint kullan
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
