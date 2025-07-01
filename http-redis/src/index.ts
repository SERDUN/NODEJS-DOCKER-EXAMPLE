import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const store = new Map<string, string>();

app.get('/get', (req: Request, res: Response) => {
    const key = req.query.key as string;
    const value = store.get(key) ?? null;
    res.json({value});
});

app.post('/set', (req: Request, res: Response) => {
    const {key, value} = req.body;
    store.set(key, value);
    res.json({ok: true});
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
