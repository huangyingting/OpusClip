FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl ffmpeg

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate --schema=prisma/schema.postgres.prisma
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV ACCOUNT_ADMISSION_MODE=invitation-only

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push --schema=prisma/schema.postgres.prisma && npm start"]
