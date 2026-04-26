import path from 'node:path';
import { createServer } from 'node:http';
import dotenv from 'dotenv';
import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import { WebSocketServer } from 'ws';
import { fetchAndRetry } from './utils';
import { DraftManager } from './engine/DraftManager';
import { handleConnection, broadcastToRoom } from './rooms/DraftRoom';

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

// API key middleware for bot-facing routes.
function requireApiKey(req: Request, res: Response, next: NextFunction): void {
	const key = process.env.ACTIVITY_API_KEY;
	if (key && req.headers['x-api-key'] !== key) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}
	next();
}

const manager = new DraftManager();

// TTL cleanup every 5 minutes.
setInterval(() => {
	const expired = manager.cleanupExpired();
	if (expired.length > 0) console.log(`Cleaned up ${expired.length} expired draft(s)`);
}, 5 * 60 * 1000);

// ── Bot HTTP API ─────────────────────────────────────────────────────────────

app.post('/api/draft/start', requireApiKey, (req: Request, res: Response) => {
	const { blueCaptainId, blueCaptainName, redCaptainId, redCaptainName } = req.body as Record<string, string>;
	if (!blueCaptainId || !blueCaptainName || !redCaptainId || !redCaptainName) {
		res.status(400).json({ error: 'Missing captain fields' });
		return;
	}
	const matchId = `GF-${Array.from({ length: 4 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('')}`;
	const draft = manager.start(matchId, blueCaptainId, blueCaptainName, redCaptainId, redCaptainName);
	if (!draft) {
		res.status(409).json({ error: 'Draft already active for this match' });
		return;
	}
	res.json({ matchId: draft.matchId, draftId: draft.draftId, state: draft.toStateSnapshot() });
});

type MatchParams = { matchId: string };

app.get('/api/draft/:matchId', requireApiKey, (req: Request<MatchParams>, res: Response) => {
	const { matchId } = req.params;
	const draft = manager.get(matchId);
	if (!draft) { res.status(404).json({ error: 'No active draft' }); return; }
	res.json(draft.toStateSnapshot());
});

app.post('/api/draft/:matchId/action', requireApiKey, (req: Request<MatchParams>, res: Response) => {
	const { matchId } = req.params;
	const draft = manager.get(matchId);
	if (!draft) { res.status(404).json({ error: 'No active draft' }); return; }

	const { god, userId } = req.body as { god: string; userId: string };
	if (!god) { res.status(400).json({ error: 'god required' }); return; }

	const turn = draft.currentGame.currentTurn();
	if (!turn) { res.status(400).json({ error: 'Game complete' }); return; }

	const expectedId = draft.getCurrentCaptainId();
	if (userId && expectedId && userId !== expectedId) {
		res.status(403).json({ error: 'Not your turn' });
		return;
	}

	if (draft.getUnavailableGods().has(god)) {
		res.status(400).json({ error: `${god} is unavailable` });
		return;
	}

	draft.executeStep(god);
	const snapshot = draft.toStateSnapshot();
	broadcastToRoom(matchId, { type: 'state', state: snapshot });
	res.json(snapshot);
});

app.post('/api/draft/:matchId/undo', requireApiKey, (req: Request<MatchParams>, res: Response) => {
	const { matchId } = req.params;
	const draft = manager.get(matchId);
	if (!draft) { res.status(404).json({ error: 'No active draft' }); return; }

	const result = draft.undo();
	if (!result) { res.status(400).json({ error: 'Nothing to undo' }); return; }

	const snapshot = draft.toStateSnapshot();
	broadcastToRoom(matchId, { type: 'state', state: snapshot });
	res.json(snapshot);
});

app.post('/api/draft/:matchId/next', requireApiKey, (req: Request<MatchParams>, res: Response) => {
	const { matchId } = req.params;
	const draft = manager.get(matchId);
	if (!draft) { res.status(404).json({ error: 'No active draft' }); return; }

	const error = draft.advanceGame();
	if (error) { res.status(400).json({ error }); return; }

	const snapshot = draft.toStateSnapshot();
	broadcastToRoom(matchId, { type: 'state', state: snapshot });
	res.json(snapshot);
});

app.post('/api/draft/:matchId/end', requireApiKey, (req: Request<MatchParams>, res: Response) => {
	const { matchId } = req.params;
	const draft = manager.end(matchId);
	if (!draft) { res.status(404).json({ error: 'No active draft' }); return; }

	const exportData = draft.toExportDict();
	broadcastToRoom(matchId, { type: 'export', export: exportData });
	res.json(exportData);
});

// ── WebSocket ─────────────────────────────────────────────────────────────────

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
	handleConnection(ws, manager);
});

server.listen(port, () => {
	console.log(`App is listening on port ${port} !`);
});
