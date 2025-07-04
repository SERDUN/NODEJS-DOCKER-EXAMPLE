FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm install
COPY . .
RUN npx tsc


FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --omit=dev

EXPOSE 4000
CMD ["node", "dist/index.js"]