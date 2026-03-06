FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY tsconfig.base.json ./
COPY services/shared ./services/shared/
COPY services/notification-service/package*.json ./services/notification-service/
RUN npm install
COPY services/notification-service/prisma ./services/notification-service/prisma/
COPY services/notification-service/src ./services/notification-service/src/
COPY services/notification-service/tsconfig.json ./services/notification-service/
WORKDIR /app/services/notification-service
RUN npx prisma generate
EXPOSE 3004
CMD ["npx", "tsx", "src/index.ts"]
