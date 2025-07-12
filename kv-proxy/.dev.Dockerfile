FROM node:18-alpine

WORKDIR /app

COPY package.json tsconfig.json ./
COPY package-lock.json* ./
RUN npm install

COPY nodemon.json ./
COPY src ./src

EXPOSE 3000

CMD ["npx", "nodemon"]