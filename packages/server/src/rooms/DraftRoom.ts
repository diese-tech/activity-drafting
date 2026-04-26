import { WebSocket } from 'ws';
import { DraftManager } from '../engine/DraftManager.js';
import type { Team } from '../engine/types.js';

export interface ClientMessage {
  type: 'join' | 'action' | 'undo' | 'next_game' | 'end' | 'start';
  matchId: string;
  // start
  blueCaptainId?: string;
  blueCaptainName?: string;
  redCaptainId?: string;
  redCaptainName?: string;
  // join
  userId?: string;
  team?: Team;
  // action
  god?: string;
}

const rooms = new Map<string, Set<WebSocket>>();

function broadcast(matchId: string, payload: object): void {
  const clients = rooms.get(matchId);
  if (!clients) return;
  const msg = JSON.stringify(payload);
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

function send(ws: WebSocket, payload: object): void {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
}

export function handleConnection(ws: WebSocket, manager: DraftManager): void {
  let joinedMatchId: string | null = null;

  ws.on('message', async (raw) => {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw.toString()) as ClientMessage;
    } catch {
      send(ws, { type: 'error', message: 'Invalid JSON' });
      return;
    }

    const { type, matchId } = msg;
    if (!matchId) {
      send(ws, { type: 'error', message: 'matchId required' });
      return;
    }

    await manager.withLock(matchId, async () => {
      if (type === 'start') {
        const { blueCaptainId, blueCaptainName, redCaptainId, redCaptainName } = msg;
        if (!blueCaptainId || !blueCaptainName || !redCaptainId || !redCaptainName) {
          send(ws, { type: 'error', message: 'Missing captain info' });
          return;
        }
        const draft = manager.start(matchId, blueCaptainId, blueCaptainName, redCaptainId, redCaptainName);
        if (!draft) {
          send(ws, { type: 'error', message: 'Draft already active for this match' });
          return;
        }
        if (!rooms.has(matchId)) rooms.set(matchId, new Set());
        rooms.get(matchId)!.add(ws);
        joinedMatchId = matchId;
        broadcast(matchId, { type: 'state', state: draft.toStateSnapshot() });
        return;
      }

      if (type === 'join') {
        const draft = manager.get(matchId);
        if (!draft) {
          send(ws, { type: 'error', message: 'No active draft for this match' });
          return;
        }
        if (!rooms.has(matchId)) rooms.set(matchId, new Set());
        rooms.get(matchId)!.add(ws);
        joinedMatchId = matchId;
        send(ws, { type: 'state', state: draft.toStateSnapshot() });
        return;
      }

      if (type === 'action') {
        const draft = manager.get(matchId);
        if (!draft) { send(ws, { type: 'error', message: 'No active draft' }); return; }
        if (!msg.god) { send(ws, { type: 'error', message: 'god required' }); return; }
        if (draft.isClaiming()) { send(ws, { type: 'error', message: 'Claiming phase — use undo to go back' }); return; }

        const turn = draft.currentGame.currentTurn();
        if (!turn) { send(ws, { type: 'error', message: 'Game complete — use next_game or end' }); return; }

        if (draft.getUnavailableGods().has(msg.god)) {
          send(ws, { type: 'error', message: `${msg.god} is unavailable` });
          return;
        }

        draft.executeStep(msg.god);
        broadcast(matchId, { type: 'state', state: draft.toStateSnapshot() });
        return;
      }

      if (type === 'undo') {
        const draft = manager.get(matchId);
        if (!draft) { send(ws, { type: 'error', message: 'No active draft' }); return; }
        const result = draft.undo();
        if (!result) { send(ws, { type: 'error', message: 'Nothing to undo' }); return; }
        broadcast(matchId, { type: 'state', state: draft.toStateSnapshot() });
        return;
      }

      if (type === 'next_game') {
        const draft = manager.get(matchId);
        if (!draft) { send(ws, { type: 'error', message: 'No active draft' }); return; }
        const error = draft.advanceGame();
        if (error) { send(ws, { type: 'error', message: error }); return; }
        broadcast(matchId, { type: 'state', state: draft.toStateSnapshot() });
        return;
      }

      if (type === 'end') {
        const draft = manager.end(matchId);
        if (!draft) { send(ws, { type: 'error', message: 'No active draft' }); return; }
        broadcast(matchId, { type: 'export', export: draft.toExportDict() });
        rooms.delete(matchId);
        return;
      }

      send(ws, { type: 'error', message: `Unknown message type: ${type}` });
    });
  });

  ws.on('close', () => {
    if (joinedMatchId) {
      rooms.get(joinedMatchId)?.delete(ws);
      if (rooms.get(joinedMatchId)?.size === 0) rooms.delete(joinedMatchId);
    }
  });
}
