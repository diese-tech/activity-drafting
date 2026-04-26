import { WsClient } from './ws-client';
import { ALL_GODS, godSlug, ICON_BASE } from './gods';
import type { StateSnapshot } from './types';

export class DraftBoard {
  private client: WsClient;
  private state: StateSnapshot | null = null;
  private myUserId: string;
  private matchId: string | null = null;
  private root: HTMLDivElement;

  constructor(root: HTMLDivElement, myUserId: string) {
    this.root = root;
    this.myUserId = myUserId;
    this.client = new WsClient((msg) => {
      if (msg.type === 'state') {
        this.state = msg.state;
        this.renderBoard();
      } else if (msg.type === 'export') {
        this.renderComplete(msg.export as object);
      } else if (msg.type === 'error') {
        this.showError(msg.message);
      }
    });
    this.client.connect();
    this.renderLobby();
  }

  private renderLobby(): void {
    this.root.innerHTML = `
      <div class="lobby">
        <h1>GodForge Draft</h1>
        <div class="lobby-form">
          <label>Match ID</label>
          <input id="matchId" type="text" placeholder="GF-XXXX" />
          <button id="joinBtn">Join Draft</button>
        </div>
        <div class="lobby-divider">— or start a new draft —</div>
        <div class="lobby-form">
          <input id="blueId" type="text" placeholder="Blue captain Discord ID" />
          <input id="blueName" type="text" placeholder="Blue captain name" />
          <input id="redId" type="text" placeholder="Red captain Discord ID" />
          <input id="redName" type="text" placeholder="Red captain name" />
          <button id="startBtn">Start Draft</button>
        </div>
        <div id="lobbyError" class="error hidden"></div>
      </div>
    `;

    this.root.querySelector('#joinBtn')!.addEventListener('click', () => {
      const id = (this.root.querySelector('#matchId') as HTMLInputElement).value.trim().toUpperCase();
      if (!id) { this.showLobbyError('Enter a match ID'); return; }
      this.matchId = id;
      this.client.send({ type: 'join', matchId: id });
    });

    this.root.querySelector('#startBtn')!.addEventListener('click', () => {
      const matchId = (this.root.querySelector('#matchId') as HTMLInputElement).value.trim().toUpperCase() || this.genId();
      const blueId = (this.root.querySelector('#blueId') as HTMLInputElement).value.trim();
      const blueName = (this.root.querySelector('#blueName') as HTMLInputElement).value.trim();
      const redId = (this.root.querySelector('#redId') as HTMLInputElement).value.trim();
      const redName = (this.root.querySelector('#redName') as HTMLInputElement).value.trim();
      if (!blueId || !blueName || !redId || !redName) { this.showLobbyError('Fill in all captain fields'); return; }
      this.matchId = matchId;
      this.client.send({ type: 'start', matchId, blueCaptainId: blueId, blueCaptainName: blueName, redCaptainId: redId, redCaptainName: redName });
    });
  }

  private genId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return 'GF-' + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  private showLobbyError(msg: string): void {
    const el = this.root.querySelector('#lobbyError') as HTMLDivElement;
    el.textContent = `⚠️ ${msg}`;
    el.classList.remove('hidden');
  }

  private showError(msg: string): void {
    const el = this.root.querySelector('#boardError') as HTMLDivElement | null;
    if (el) {
      el.textContent = `⚠️ ${msg}`;
      el.classList.remove('hidden');
      setTimeout(() => el.classList.add('hidden'), 4000);
    } else {
      console.error(msg);
    }
  }

  private isMyTurn(): boolean {
    if (!this.state) return false;
    return this.state.currentCaptainId === this.myUserId;
  }

  private isCaptain(): boolean {
    if (!this.state) return false;
    return (
      this.state.blueCaptain.userId === this.myUserId ||
      this.state.redCaptain.userId === this.myUserId
    );
  }

  private renderBoard(): void {
    const s = this.state!;
    const turn = s.currentTurn;
    const isMine = this.isMyTurn();
    const captain = this.isCaptain();
    const gameComplete = !turn;

    let statusHtml = '';
    if (gameComplete) {
      statusHtml = `<span class="status-complete">✅ Game ${s.gameNumber} complete</span>`;
    } else {
      const emoji = turn.team === 'blue' ? '🔵' : '🔴';
      const captainName = turn.team === 'blue' ? s.blueCaptain.name : s.redCaptain.name;
      const highlight = isMine ? ' your-turn' : '';
      statusHtml = `<span class="status-turn${highlight}">${emoji} <b>${captainName}</b> — ${turn.action}</span>`;
    }

    const fearlessHtml = s.fearlessPool.length
      ? `<div class="fearless-pool"><span class="label">🚫 Fearless Pool:</span> ${s.fearlessPool.join(', ')}</div>`
      : '';

    const gameControls = gameComplete && captain ? `
      <div class="game-controls">
        <button id="nextGameBtn">▶ Next Game</button>
        <button id="endDraftBtn" class="btn-secondary">🏁 End Draft</button>
      </div>
    ` : '';

    this.root.innerHTML = `
      <div class="board">
        <div class="board-header">
          <span class="draft-meta">${s.draftId} · Game ${s.gameNumber} · ${s.phase}</span>
          <div class="turn-status">${statusHtml}</div>
          ${isMine ? `<button id="undoBtn" class="btn-secondary">↩ Undo</button>` : ''}
        </div>

        <div class="board-teams">
          ${this.renderTeam('blue', s)}
          ${this.renderTeam('red', s)}
        </div>

        ${fearlessHtml}
        ${gameControls}

        <div id="boardError" class="error hidden"></div>

        ${isMine && !gameComplete ? this.renderGodSelector(s) : ''}
      </div>
    `;

    if (isMine) {
      this.root.querySelector('#undoBtn')?.addEventListener('click', () => {
        this.client.send({ type: 'undo', matchId: this.matchId! });
      });

      const searchInput = this.root.querySelector('#godSearch') as HTMLInputElement | null;
      searchInput?.addEventListener('input', () => {
        this.filterGods(searchInput.value, s.unavailableGods);
      });

      this.root.querySelectorAll('.god-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const god = (btn as HTMLButtonElement).dataset.god!;
          this.client.send({ type: 'action', matchId: this.matchId!, god });
        });
      });
    }

    if (gameComplete && captain) {
      this.root.querySelector('#nextGameBtn')?.addEventListener('click', () => {
        this.client.send({ type: 'next_game', matchId: this.matchId! });
      });
      this.root.querySelector('#endDraftBtn')?.addEventListener('click', () => {
        this.client.send({ type: 'end', matchId: this.matchId! });
      });
    }
  }

  private renderTeam(team: 'blue' | 'red', s: StateSnapshot): string {
    const emoji = team === 'blue' ? '🔵' : '🔴';
    const captain = team === 'blue' ? s.blueCaptain : s.redCaptain;
    const bans = s.bans[team];
    const picks = s.picks[team];
    const claims = s.claims[team];

    const banSlots = Array.from({ length: 5 }, (_, i) => {
      const god = bans[i];
      return god
        ? `<div class="slot slot-ban filled"><img src="${ICON_BASE}/${godSlug(god)}.png" onerror="this.style.display='none'" /><span>${god}</span></div>`
        : `<div class="slot slot-ban empty">—</div>`;
    }).join('');

    const pickSlots = Array.from({ length: 5 }, (_, i) => {
      const god = picks[i];
      const claim = god ? claims[god] : null;
      return god
        ? `<div class="slot slot-pick filled"><img src="${ICON_BASE}/${godSlug(god)}.png" onerror="this.style.display='none'" /><span>${god}</span>${claim ? `<span class="claim-name">${claim.name}</span>` : ''}</div>`
        : `<div class="slot slot-pick empty">—</div>`;
    }).join('');

    return `
      <div class="team team-${team}">
        <h2>${emoji} ${captain.name}</h2>
        <div class="slot-section"><div class="slot-label">Bans</div><div class="slots">${banSlots}</div></div>
        <div class="slot-section"><div class="slot-label">Picks</div><div class="slots">${pickSlots}</div></div>
      </div>
    `;
  }

  private renderGodSelector(s: StateSnapshot): string {
    const unavailable = new Set(s.unavailableGods);
    const godButtons = ALL_GODS
      .filter(god => !unavailable.has(god))
      .map(god => `<button class="god-btn" data-god="${god}">${god}</button>`)
      .join('');

    return `
      <div class="god-selector">
        <input id="godSearch" type="text" placeholder="Search gods..." autocomplete="off" />
        <div class="god-grid" id="godGrid">${godButtons}</div>
      </div>
    `;
  }

  private filterGods(query: string, _unavailable: string[]): void {
    const q = query.toLowerCase();
    this.root.querySelectorAll('.god-btn').forEach(btn => {
      const god = (btn as HTMLButtonElement).dataset.god!;
      (btn as HTMLElement).style.display = god.toLowerCase().includes(q) ? '' : 'none';
    });
  }

  private renderComplete(exportData: object): void {
    this.root.innerHTML = `
      <div class="complete">
        <h1>🏁 Draft Complete</h1>
        <pre>${JSON.stringify(exportData, null, 2)}</pre>
      </div>
    `;
  }
}
