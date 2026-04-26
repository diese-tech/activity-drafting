import type { Team, Action, TurnStep, ClaimInfo, GameExport } from './types.js';

// Smite classic fearless draft sequence — 20 steps per game.
export const TURN_SEQUENCE: TurnStep[] = [
  // Bans 1: B R B R B R
  { team: 'blue', action: 'ban' }, { team: 'red', action: 'ban' },
  { team: 'blue', action: 'ban' }, { team: 'red', action: 'ban' },
  { team: 'blue', action: 'ban' }, { team: 'red', action: 'ban' },
  // Picks 1: R B B R R B
  { team: 'red', action: 'pick' }, { team: 'blue', action: 'pick' },
  { team: 'blue', action: 'pick' }, { team: 'red', action: 'pick' },
  { team: 'red', action: 'pick' }, { team: 'blue', action: 'pick' },
  // Bans 2: R B R B
  { team: 'red', action: 'ban' }, { team: 'blue', action: 'ban' },
  { team: 'red', action: 'ban' }, { team: 'blue', action: 'ban' },
  // Picks 2: B R R B
  { team: 'blue', action: 'pick' }, { team: 'red', action: 'pick' },
  { team: 'red', action: 'pick' }, { team: 'blue', action: 'pick' },
];

export const STEPS_PER_GAME = TURN_SEQUENCE.length;

const PHASE_RANGES: [number, number, string][] = [
  [0, 5, 'Bans 1'],
  [6, 11, 'Picks 1'],
  [12, 15, 'Bans 2'],
  [16, 19, 'Picks 2'],
];

export function getPhaseLabel(step: number): string {
  for (const [start, end, label] of PHASE_RANGES) {
    if (step >= start && step <= end) return label;
  }
  return 'Complete';
}

export class GameState {
  gameNumber: number;
  bans: { blue: string[]; red: string[] };
  picks: { blue: string[]; red: string[] };
  step: number;
  claims: { blue: Record<string, ClaimInfo>; red: Record<string, ClaimInfo> };

  constructor(gameNumber: number) {
    this.gameNumber = gameNumber;
    this.bans = { blue: [], red: [] };
    this.picks = { blue: [], red: [] };
    this.step = 0;
    this.claims = { blue: {}, red: {} };
  }

  isComplete(): boolean {
    return this.step >= STEPS_PER_GAME;
  }

  isFullyClaimed(): boolean {
    if (!this.isComplete()) return false;
    for (const side of ['blue', 'red'] as Team[]) {
      if (Object.keys(this.claims[side]).length < this.picks[side].length) return false;
    }
    return true;
  }

  currentTurn(): TurnStep | null {
    if (this.isComplete()) return null;
    return TURN_SEQUENCE[this.step];
  }

  getAllGods(): Set<string> {
    const gods = new Set<string>();
    for (const side of ['blue', 'red'] as Team[]) {
      this.bans[side].forEach(g => gods.add(g));
      this.picks[side].forEach(g => gods.add(g));
    }
    return gods;
  }

  execute(god: string): TurnStep {
    const turn = TURN_SEQUENCE[this.step];
    if (turn.action === 'ban') {
      this.bans[turn.team].push(god);
    } else {
      this.picks[turn.team].push(god);
    }
    this.step++;
    return turn;
  }

  undo(): { team: Team; action: Action; god: string } | null {
    if (this.step <= 0) return null;
    this.step--;
    const { team, action } = TURN_SEQUENCE[this.step];
    const list = action === 'ban' ? this.bans[team] : this.picks[team];
    const god = list.pop()!;
    return { team, action, god };
  }

  claim(team: Team, god: string, userId: string, userName: string): boolean {
    if (!this.picks[team].includes(god)) return false;
    if (god in this.claims[team]) return false;
    for (const info of Object.values(this.claims[team])) {
      if (info.userId === userId) return false;
    }
    this.claims[team][god] = { userId, name: userName, role: null, stats: null };
    return true;
  }

  unclaim(team: Team, god: string): ClaimInfo | null {
    const info = this.claims[team][god] ?? null;
    if (info) delete this.claims[team][god];
    return info;
  }

  toDict(): GameExport {
    return {
      gameNumber: this.gameNumber,
      bans: { blue: [...this.bans.blue], red: [...this.bans.red] },
      picks: { blue: [...this.picks.blue], red: [...this.picks.red] },
      claims: {
        blue: { ...this.claims.blue },
        red: { ...this.claims.red },
      },
    };
  }
}
