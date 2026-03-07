FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY tsconfig.base.json ./
COPY services/shared ./services/shared/
COPY services/account-service/package*.json ./services/account-service/
RUN npm install
COPY services/account-service/prisma ./services/account-service/prisma/
COPY services/account-service/src ./services/account-service/src/
COPY services/account-service/tsconfig.json ./services/account-service/
WORKDIR /app/services/account-service
RUN npx prisma generate
EXPOSE 3002
COPY services/account-service/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh
CMD ["sh", "entrypoint.sh"]
