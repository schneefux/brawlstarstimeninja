export interface PlayerHistoryEntry {
  timestamp: Date;
  trophies: number;
  total_exp: number;
}

export interface BrawlerHistoryEntry {
  name: string;
  timestamp: Date;
  trophies: number;
}

export default interface History {
  playerHistory: PlayerHistoryEntry[];
  brawlerHistory: BrawlerHistoryEntry[];
}
