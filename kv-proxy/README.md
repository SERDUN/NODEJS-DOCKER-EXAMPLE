```bash
docker build -t kv -f .Dockerfile .
```

Run the container:

```bash
 docker run --network internal -p 4000:4000 -e REDIS_URL=http://localhost:3000 -e PORT=4000 kv
```