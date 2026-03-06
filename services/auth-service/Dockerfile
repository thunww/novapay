FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY tsconfig.base.json ./
COPY services/shared ./services/shared/
COPY services/auth-service/package*.json ./services/auth-service/
RUN npm install
COPY services/auth-service/prisma ./services/auth-service/prisma/
COPY services/auth-service/src ./services/auth-service/src/
COPY services/auth-service/tsconfig.json ./services/auth-service/
WORKDIR /app/services/auth-service
RUN npx prisma generate
EXPOSE 3001
CMD ["npx", "tsx", "src/index.ts"]
