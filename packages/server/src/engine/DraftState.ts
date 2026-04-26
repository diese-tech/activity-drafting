import { GameState, getPhaseLabel } from './GameState.js';
import type { Team, DraftExport, StateSnapshot } from './types.js';

const DRAFT_TTL_MS = 60 * 60 * 1000;

function generateDraftId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const id = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `GF-${id}`;
}

type UndoEntry =
  | { type: 'step'; team: Team; action: string; god: string }
  | { type: 'claim'; team: Team; god: string }
  | { type: 'next_game'; previousGame: GameState; previousFearless: Set<string> };

export class DraftState {
  readonly draftId: string;
  readonly matchId: string;
  active: boolean;
  private lastUpdated: number;
  readonly startedAt: string;
  endedAt: string | null;

  readonly blueCaptain: { userId: string; name: string };
  readonly redCaptain: { userId: string; name: string };

  fearlessPool: Set<string>;
  completedGames: GameState[];
  currentGame: GameState;
  private undoStack: UndoEntry[];

  constructor(
    matchId: string,
    blueCaptainId: string, blueCaptainName: string,
    redCaptainId: string, redCaptainName: string,
  ) {
    this.draftId = generateDraftId();
    this.matchId = matchId;
    this.active = true;
    this.lastUpdated = Date.now();
    this.startedAt = new Date().toISOString();
    this.endedAt = null;

    this.blueCaptain = { userId: blueCaptainId, name: blueCaptainName };
    this.redCaptain = { userId: redCaptainId, name: redCaptainName };

    this.fearlessPool = new Set();
    this.completedGames = [];
    this.currentGame = new GameState(1);
    this.undoStack = [];
  }

  private touch(): void {
    this.lastUpdated = Date.now();
  }

  isExpired(): boolean {
    return Date.now() - this.lastUpdated > DRAFT_TTL_MS;
  }

  isClaiming(): boolean {
    return this.currentGame.isComplete() && !this.currentGame.isFullyClaimed();
  }

  getUnavailableGods(): Set<string> {
    const unavailable = new Set(this.fearlessPool);
    this.currentGame.getAllGods().forEach(g => unavailable.add(g));
    return unavailable;
  }

  getCurrentCaptainId(): string | null {
    const turn = this.currentGame.currentTurn();
    if (!turn) return null;
    return turn.team === 'blue' ? this.blueCaptain.userId : this.redCaptain.userId;
  }

  executeStep(god: string): { team: Team; action: string } {
    const turn = this.currentGame.execute(god);
    this.undoStack.push({ type: 'step', team: turn.team, action: turn.action, god });
    this.touch();
    return turn;
  }

  claimGod(team: Team, god: string, userId: string, userName: string): boolean {
    if (!this.currentGame.claim(team, god, userId, userName)) return false;
    this.undoStack.push({ type: 'claim', team, god });
    this.touch();
    return true;
  }

  undo(): { type: string; team?: Team; action?: string; god?: string; gameNumber?: number; userName?: string } | null {
    const entry = this.undoStack.pop();
    if (!entry) return null;

    if (entry.type === 'step') {
      const result = this.currentGame.undo();
      if (!result) return null;
      this.touch();
      return { type: 'step', team: result.team, action: result.action, god: result.god };
    }

    if (entry.type === 'claim') {
      const info = this.currentGame.unclaim(entry.team, entry.god);
      if (!info) return null;
      this.touch();
      return { type: 'claim', team: entry.team, god: entry.god, userName: info.name };
    }

    if (entry.type === 'next_game') {
      this.completedGames.pop();
      this.currentGame = entry.previousGame;
      this.fearlessPool = entry.previousFearless;
      this.touch();
      return { type: 'next_game', gameNumber: entry.previousGame.gameNumber };
    }

    return null;
  }

  advanceGame(): string | null {
    if (!this.currentGame.isComplete()) {
      return "Current game isn't complete yet. Finish all bans and picks first.";
    }
    if (!this.currentGame.isFullyClaimed()) {
      return "Not all players have claimed their gods yet.";
    }

    this.undoStack.push({
      type: 'next_game',
      previousGame: this.currentGame,
      previousFearless: new Set(this.fearlessPool),
    });

    for (const side of ['blue', 'red'] as Team[]) {
      this.currentGame.picks[side].forEach(g => this.fearlessPool.add(g));
    }

    this.completedGames.push(this.currentGame);
    this.currentGame = new GameState(this.completedGames.length + 1);
    this.touch();
    return null;
  }

  end(): DraftExport {
    this.active = false;
    this.endedAt = new Date().toISOString();
    return this.toExportDict();
  }

  toExportDict(): DraftExport {
    const games = [
      ...this.completedGames.map(g => g.toDict()),
      ...(this.currentGame.step > 0 ? [this.currentGame.toDict()] : []),
    ];
    return {
      draftId: this.draftId,
      matchId: this.matchId,
      blueCaptain: { ...this.blueCaptain },
      redCaptain: { ...this.redCaptain },
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      games,
      fearlessPool: [...this.fearlessPool].sort(),
    };
  }

  toStateSnapshot(): StateSnapshot {
    const game = this.currentGame;
    const turn = game.currentTurn();
    return {
      draftId: this.draftId,
      matchId: this.matchId,
      active: this.active,
      gameNumber: game.gameNumber,
      step: game.step,
      phase: getPhaseLabel(game.step),
      currentTurn: turn,
      currentCaptainId: this.getCurrentCaptainId(),
      bans: { blue: [...game.bans.blue], red: [...game.bans.red] },
      picks: { blue: [...game.picks.blue], red: [...game.picks.red] },
      claims: { blue: { ...game.claims.blue }, red: { ...game.claims.red } },
      fearlessPool: [...this.fearlessPool].sort(),
      unavailableGods: [...this.getUnavailableGods()],
      isClaiming: this.isClaiming(),
      blueCaptain: { ...this.blueCaptain },
      redCaptain: { ...this.redCaptain },
    };
  }
}
