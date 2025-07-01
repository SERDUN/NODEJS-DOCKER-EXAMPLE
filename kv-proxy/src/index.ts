import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error('REDIS_URL is not defined in environment variables');
}

app.use(express.json());

app.get('/kv/:key', async (req: Request, res: Response) => {
    const key = req.params.key;
    try {
        const response = await fetch(`${redisUrl}/get?key=${encodeURIComponent(key)}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching from redis-like server:', error);
        res.status(502).json({error: 'Failed to connect to redis-like server'});
    }
});

app.post('/kv', async (req: Request, res: Response) => {
    const {key, value} = req.body;
    try {
        const response = await fetch(`${redisUrl}/set`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({key, value}),
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error posting to redis-like server:', error);
        res.status(502).json({error: 'Failed to connect to redis-like server'});
    }
});

app.listen(port, () => {
    console.log(`kv-proxy running at http://localhost:${port}`);
});
