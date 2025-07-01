FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

EXPOSE 4000

CMD ["node", "dist/index.js"]
