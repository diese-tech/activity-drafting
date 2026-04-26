import path from 'node:path';
import { createServer } from 'node:http';
import dotenv from 'dotenv';
import express, { type Application, type Request, type Response } from 'express';
import { WebSocketServer } from 'ws';
import { fetchAndRetry } from './utils';
import { DraftManager } from './engine/DraftManager';
import { handleConnection } from './rooms/DraftRoom';

dotenv.config({ path: '../../.env' });

const app: Application = express();
const port: number = Number(process.env.PORT) || 3001;

app.use(express.json());

if (process.env.NODE_ENV === 'production') {
	const clientBuildPath = path.join(__dirname, '../../client/dist');
	app.use(express.static(clientBuildPath));
}

// OAuth token exchange for the Discord Embedded App SDK.
app.post('/api/token', async (req: Request, res: Response) => {
	const response = await fetchAndRetry('https://discord.com/api/oauth2/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: process.env.VITE_CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			grant_type: 'authorization_code',
			code: req.body.code,
		}),
	});
	const { access_token } = (await response.json()) as { access_token: string };
	res.send({ access_token });
});

const manager = new DraftManager();

// TTL cleanup every 5 minutes.
setInterval(() => {
	const expired = manager.cleanupExpired();
	if (expired.length > 0) console.log(`Cleaned up ${expired.length} expired draft(s)`);
}, 5 * 60 * 1000);

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
	handleConnection(ws, manager);
});

server.listen(port, () => {
	console.log(`App is listening on port ${port} !`);
});
