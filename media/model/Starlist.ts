export interface StarlistBrawler {
  id: number;
  avatarId: number;
  name: string;
  hash: string;
  path: string;
  released: boolean;
  version: number;
  link: string; // starlist detail page
  imageUrl: string; // avatar with border
  imageUrl2: string; // avatar without border
  imageUrl3: string; // emote
  class: {
    id: number;
    name: string;
  };
  rarity: {
    id: number;
    name: string;
  };
  unlock: number; // trophies
  description: string;
  starPowers: {
    id: number;
    name: string;
    path: string;
    description: string;
    imageUrl: string;
    released: boolean;
  }[];
  gadgets: {
    id: number;
    name: string;
    path: string;
    description: string;
    imageUrl: string;
    released: boolean;
  }[];
  videos: {
    type: number;
    name: string;
    description: string;
    duration: string;
    videoUrl: string;
    previewUrl: string;
    uploadDate: string;
  }[];
}

export interface StarlistMode {
  id: number;
  name: string;
  hash: string;
  disabled: boolean;
  version: number;
  title: string;
  tutorial: string;
  description: string;
  shortDescription: string;
  sort1: number; // ?
  sort2: number; // ?
  link: string; // starlist detail page
  imageUrl: string; // icon
  imageUrl2: string; // background
}

export interface StarlistMap {
  id: number;
  new: boolean;
  disabled: boolean;
  name: string;
  hash: string;
  version: number;
  link: string; // starlist detail page
  imageUrl: string;
  credit: string;
  environment: {
    id: number;
    name: string;
    hash: string;
    path: string;
    version: number;
    imageUrl: string;
  };
  gameMode: StarlistMode;
}

export interface StarlistIcon {
  id: number;
  imageUrl: string;
  imageUrl2: string; // low-res
  brawler: number|null;
}
