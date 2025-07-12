## 🛠️ Docker Commands

### 📦 List Docker Images

```bash
docker images
```

### 🚀 Run with Docker Compose

> Builds and starts all services defined in `docker-compose.yml`.

```bash
docker-compose up --build
```

### Run dev with Docker Compose

```
docker-compose -f dev.docker-compose.yml up --build
```

### 🧪 Run with Custom Mini Compose

> Starts services based on your `compose.json` using a custom script.

```bash
node index.js up
```