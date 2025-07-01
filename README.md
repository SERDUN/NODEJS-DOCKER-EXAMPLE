# Node.js KV Stack — Redis-like + KV Server in Docker

A minimal stack of two HTTP services (`redis-like` + `kv-server`), containerized via Docker with custom network, base
images, and development mode with hot-reload support.

## Project Structure

```
.
├── compose/              # Custom implementation of docker-compose
│   ├── compose.json      # JSON config with network and services
│   ├── docker-compose.yml
│   ├── index.js          # Custom miniCompose.js implementation
│   └── kv-proxy/         # Proxy example for testing
├── http-redis/           # Redis-like server
├── kv-proxy/             # Proxy server to redis-like
└── README.md
```

---

## 1. Redis-like Service

### Location:

```bash
./http-redis
```

### Endpoints:

- `GET /get?key=foo` → `{"value": "bar" | null}`
- `POST /set` with body `{ "key": "foo", "value": "bar" }` → `{"ok": true}`

In-memory storage is implemented using `Map`.

---

## 2. KV-server (Proxy)

### Location:

```bash
./kv-proxy
```

### Endpoints:

- `GET /kv/:key` → Proxies to `/get?key=...`
- `POST /kv` → Proxies to `/set`

`REDIS_URL` is provided via `process.env.REDIS_URL`.

Connected via built-in `fetch()` (Node.js v18+).

---

## 3. Docker

### Dockerfiles:

- `http-redis/.Dockerfile` — builds redis-like
- `kv-proxy/.Dockerfile` — builds kv-server (multi-stage)

---

## 4. Docker Compose

```yaml
version: '3.8'

services:
  redis:
    build:
      context: .././http-redis
      dockerfile: .Dockerfile
    ports:
      - "3000:3000"
    expose:
      - "3000"
    networks:
      internal:
    environment:
      PORT: "3000"

  kv:
    build:
      context: .././kv-proxy
      dockerfile: .Dockerfile
    ports:
      - "4000:4000"
    networks:
      internal:
    depends_on:
      - redis
    environment:
      REDIS_URL: http://redis:3000
      PORT: "4000"

    volumes:
      - ./kv-proxy/src:/app/src

networks:
  internal:
```

Internal bridge network: `internal`

---

## 5. Build & Run

### Docker (manual)

```bash
docker build -t redis -f .Dockerfile .
docker build -t kv -f .Dockerfile .
```

### Docker Compose

```bash
docker-compose up --build
```

### Custom Compose Implementation (Node.js)

```bash
cd compose
node index.js up      # Starts containers
node index.js down    # Stops and cleans up
```

Docker Hub:

```
https://hub.docker.com/repository/docker/serdun/redis-like
https://hub.docker.com/repository/docker/serdun/kv-proxy
```
