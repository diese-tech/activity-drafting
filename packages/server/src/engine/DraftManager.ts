import { DraftState } from './DraftState.js';

export class DraftManager {
  private drafts = new Map<string, DraftState>();
  private locks = new Map<string, Promise<void>>();

  async withLock<T>(matchId: string, fn: () => Promise<T>): Promise<T> {
    const prev = this.locks.get(matchId) ?? Promise.resolve();
    let release!: () => void;
    const next = prev.then(() => new Promise<void>(r => { release = r; }));
    this.locks.set(matchId, next);
    await prev;
    try {
      return await fn();
    } finally {
      release();
      if (this.locks.get(matchId) === next) this.locks.delete(matchId);
    }
  }

  start(
    matchId: string,
    blueCaptainId: string, blueCaptainName: string,
    redCaptainId: string, redCaptainName: string,
  ): DraftState | null {
    const existing = this.drafts.get(matchId);
    if (existing?.active) return null;
    const draft = new DraftState(matchId, blueCaptainId, blueCaptainName, redCaptainId, redCaptainName);
    this.drafts.set(matchId, draft);
    return draft;
  }

  get(matchId: string): DraftState | null {
    const draft = this.drafts.get(matchId);
    return draft?.active ? draft : null;
  }

  end(matchId: string): DraftState | null {
    const draft = this.drafts.get(matchId);
    this.drafts.delete(matchId);
    this.locks.delete(matchId);
    if (draft?.active) {
      draft.end();
      return draft;
    }
    return null;
  }

  cleanupExpired(): string[] {
    const expired: string[] = [];
    for (const [id, draft] of this.drafts) {
      if (draft.isExpired()) expired.push(id);
    }
    for (const id of expired) {
      this.drafts.delete(id);
      this.locks.delete(id);
    }
    return expired;
  }
}
