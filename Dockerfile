
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN apk add --no-cache openssl \
 && npm ci --ignore-scripts

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN apk add --no-cache openssl \
 && npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

RUN addgroup -S lurevia && adduser -S lurevia -G lurevia
USER lurevia

EXPOSE 4000