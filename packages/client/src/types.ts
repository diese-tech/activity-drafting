export interface TurnStep {
  team: 'blue' | 'red';
  action: 'pick' | 'ban';
}

export interface ClaimInfo {
  userId: string;
  name: string;
  role: string | null;
  stats: string | null;
}

export interface StateSnapshot {
  draftId: string;
  matchId: string;
  active: boolean;
  gameNumber: number;
  step: number;
  phase: string;
  currentTurn: TurnStep | null;
  currentCaptainId: string | null;
  bans: { blue: string[]; red: string[] };
  picks: { blue: string[]; red: string[] };
  claims: { blue: Record<string, ClaimInfo>; red: Record<string, ClaimInfo> };
  fearlessPool: string[];
  unavailableGods: string[];
  isClaiming: boolean;
  blueCaptain: { userId: string; name: string };
  redCaptain: { userId: string; name: string };
}
