FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY tsconfig.base.json ./
COPY services/shared ./services/shared/
COPY services/transaction-service/package*.json ./services/transaction-service/
RUN npm install
COPY services/transaction-service/prisma ./services/transaction-service/prisma/
COPY services/transaction-service/src ./services/transaction-service/src/
COPY services/transaction-service/tsconfig.json ./services/transaction-service/
WORKDIR /app/services/transaction-service
RUN npx prisma generate
EXPOSE 3003
COPY services/transaction-service/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh
CMD ["sh", "entrypoint.sh"]
