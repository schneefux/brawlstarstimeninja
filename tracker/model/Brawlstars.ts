export interface Brawler {
  id: number;
  name: string;
  power: number;
  rank: number;
  trophies: number;
  highestTrophies: number;
  starPowers: {
    id: number;
    name: string;
  }[];
}

export interface Player {
  tag: string;
  name: string;
  nameColor: string;
  trophies: number;
  highestTrophies: number;
  expLevel: number;
  expPoints: number;
  '3vs3Victories': number;
  soloVictories: number;
  duoVictories: number;
  bestRoboRumbleTime: number;
  bestTimeAsBigBrawler: number;
  club: null | {
    tag: string;
    name: string;
  };
  brawlers: Brawler[];
}

export interface Event {
  slot: number;
  slotName: string;
  startTimeInSeconds: number;
  startTime: string;
  endTimeInSeconds: number;
  endTime: string;
  freeKeys: number;
  mapId: number;
  mapName: string;
  mapImageUrl: string;
  gameMode: string;
  hasModifier: boolean;
  modifierId: number;
  modifierName: string;
}

export interface BattlePlayer {
  tag: string;
  name: string;
  brawler: {
    id: number;
    name: string;
    power: number;
    trophies: number;
  }
}

export interface BattleLog {
  items: {
    battleTime: string;
    event: {
      id: number;
      mode: string;
      map: string;
    }
    battle: {
      mode: string;
      type?: string;
      result?: string;
      duration?: number;
      rank?: number;
      trophyChange?: number;
      level: {
        name: null;
        id: number;
      }; // bossfight
      starPlayer?: BattlePlayer;
      teams: BattlePlayer[][]; // 3v3
      players: BattlePlayer[]; // showdown, bossfight
      bigBrawler: BattlePlayer; // bossfight
    }
  }[]
  paging: {}
}
