# ========== Build Stage ==========
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ========== Production Stage ==========
FROM node:20-slim

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm install --production && npm cache clean --force

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]
