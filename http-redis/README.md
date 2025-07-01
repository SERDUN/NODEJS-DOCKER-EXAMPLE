# Redis-like HTTP Key/Value Store

A minimal in-memory key-value store with an HTTP interface, built in Node.js.

## Features

- Simple in-memory storage using JavaScript `Map`
- HTTP API for `GET` and `SET` operations

## API Endpoints

### `POST /set`

Stores a value under a given key.

**Request body (JSON):**

```json
{
  "key": "foo",
  "value": "bar"
}
```

**Response:**

```json
{
  "ok": true
}
```

---

### `GET /get?key=foo`

Retrieves a value by key.

**Response:**

```json
{
  "value": "bar"
}
```

If the key does not exist:

```json
{
  "value": null
}
```

## Docker

Build the image:

```bash
docker build -t redis -f .Dockerfile .
```

Run the container:

```bash
 docker run --network internal -p 3000:3000  redis
```