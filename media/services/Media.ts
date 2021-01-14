import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import cacheManager from 'cache-manager';
import fsStore from 'cache-manager-fs-hash';
import { StarlistBrawler, StarlistIcon, StarlistMap, StarlistMode } from '~/model/Starlist';
import { BrawlerData, DataSkill, DataCharacter, DataCard, DataAccessory, RARITY } from '~/model/Media';
import { brawlerId } from '../lib/util';

const assetDir = process.env.ASSET_DIR || path.join(path.dirname(__dirname), 'assets');

console.log('using asset directory ' + assetDir);

const cachePath = process.env.CACHE_PATH || 'cache';
const cacheDisable = !!process.env.CACHE_DISABLE;

export const cache = cacheDisable ?
  cacheManager.caching({
    store: 'memory',
    max: 0,
    ttl: 60 * 60,
  }) :
  cacheManager.caching(<any>{
    max: 10000,
    store: fsStore,
    ttl: 60 * 60,
    options: { path: cachePath, subdirs: true, },
  });


const starlistUrl = process.env.BRAWLAPI_URL || 'https://api.starlist.pro/';
const token = process.env.BRAWLAPI_TOKEN || '';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function request(url: string) {
  return Promise.race([
    sleep(2000).then(() => { throw new Error('API Timeout') }),
    cache.wrap(url, () => fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token },
      compress: true,
    }).then(res => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    }).then(json => {
      if ('error' in json && json.error) {
        throw new Error(json.message);
      }
      return json;
    }))
  ]);
}

export default class MediaService {
  public async getBrawlerAvatar(name: string, accept: string): Promise<Buffer|null> {
    try {
      const path = assetDir + '/profiles/' + name + '.png';
      await fs.promises.access(path);
      return fs.promises.readFile(path);
    } catch (err) {
      console.log('Brawler avatar not found (local): ' + name);
    }

    const brawler = await this.getStarlistBrawler(name)
    if (brawler == null) {
      console.log('Brawler avatar not found (starlist): ' + name);
      return null;
    }

    const url = brawler.imageUrl2;
    try {
      return await fetch(url, { headers: { accept } })
      .then(res => res.buffer());
    } catch (err) {
      console.log('Brawler avatar fetch error: ' + err);
      return null;
    }
  }

  public async getBrawlerModel(name: string, accept: string): Promise<Buffer|null> {
    const path = assetDir + '/models/' + name + '.png';
    try {
      await fs.promises.access(path);
      return fs.promises.readFile(path);
    } catch(err) {
      console.log('Brawler model not found (local): ' + name);
      return null;
    }
  }

  public async getBrawlerInfo(name: string) {
    const characters = JSON.parse(await fs.promises.readFile(assetDir + '/data/characters.json', 'utf-8')) as DataCharacter[]
    const skills = JSON.parse(await fs.promises.readFile(assetDir + '/data/skills.json', 'utf-8')) as DataSkill[]
    // unlocks
    const cards = JSON.parse(await fs.promises.readFile(assetDir + '/data/cards.json', 'utf-8')) as DataCard[]
    // gadgets
    const accessories = JSON.parse(await fs.promises.readFile(assetDir + '/data/accessories.json', 'utf-8')) as DataAccessory[]
    const tids = JSON.parse(await fs.promises.readFile(assetDir + '/data/tid.json', 'utf-8')) as {
      [key: string]: string
    }

    const id = brawlerId({ name: name })
    const character = characters.find(c => (c.itemName || '').replace(/[.-]/g, '').replace('ricochet', 'rico') == id.replace(/[_-]/g, ''))
    if (character == undefined) {
      console.log('brawler not found: ' + name)
      return null
    }
    const characterDescription = tids['TID_' + character.rawTID + '_DESC']
    const mainSkill = skills.find(s => s.name == character.weaponSkill)!
    const superSkill = skills.find(s => s.name == character.ultimateSkill)!
    const characterUnlockCard = cards.find(c => c.name == character.name + '_unlock')
    const mainCard = cards.find(c => c.name == character.name + '_abi')!
    const superCard = cards.find(c => c.name == character.name + '_ulti')!
    const starCards = cards.filter(c => c.name.startsWith(character.name + '_unique'))
    const gadgetCards = cards.filter(c => c.name.startsWith(character.name) && c.iconExportName?.startsWith('icon_item_'))
    const gadgetAccessories = gadgetCards.map(g => accessories.find(a => a.name == g.name)!)
    const getStarpowerDescription = (c: DataCard) =>
      tids['TID_' + c.rawTID + '_DESC']
        .replace(/<VALUE1>/g, c.value?.toString() || '')
        .replace(/<VALUE2>/g, c.value2?.toString() || '')
        .replace(/<VALUE3>/g, c.value3?.toString() || '')
        .replace(/<\/?c\w{0,6}>/g, '') // color codes
        .replace(/\\n/g, '\n')
    const getGadgetDescription = (c: DataCard, a: DataAccessory) =>
      tids['TID_' + c.rawTID + '_DESC']
        .replace(/<VALUE1>/g, a.customValue1?.toString() || '')
        .replace(/<VALUE2>/g, a.customValue2?.toString() || '')
        .replace(/<VALUE3>/g, a.customValue3?.toString() || '')
        .replace(/<VALUE4>/g, a.customValue4?.toString() || '')
        .replace(/<VALUE5>/g, a.customValue5?.toString() || '')
        .replace(/<VALUE6>/g, a.customValue6?.toString() || '')
        .replace(/<\/?c\w{0,6}>/g, '') // color codes
        .replace(/\\n/g, '\n')
    const getSkillDescription = (c: DataCard, s: DataSkill) =>
      tids['TID_' + c.rawTID + '_DESC']
        .replace(/<time>/g, s.activeTime != null ? (s.activeTime / 1000).toString() : '')
        .replace(/<num>/g, s.msBetweenAttacks?.toString() || '')
        .replace(/\\n/g, '\n')
    const starpowerDescriptions = starCards.reduce((d, c) => ({
      ...d,
      [c.tID]: getStarpowerDescription(c),
    }), {} as { [key: string]: string })
    const gadgetDescriptions = gadgetCards.reduce((d, c, index) => ({
      ...d,
      [c.tID]: getGadgetDescription(c, gadgetAccessories[index]),
    }), {} as { [key: string]: string })
    const mainDescription = getSkillDescription(mainCard, mainSkill)
    const superDescription = getSkillDescription(superCard, superSkill)

    // TODO values in starpower/gadget descriptions
    // need custom formatting based on some type attribute (implemented client-side)
    const brawler = await this.getStarlistBrawler(name)
    if (brawler != null) {
      const starlistStarpowerDescriptions = brawler.starPowers.reduce((d, s) => ({
        ...d,
        [s.name.toUpperCase()]: s.description,
      }), {} as Record<string, string>)
      Object.assign(starpowerDescriptions, starlistStarpowerDescriptions)

      const starlistGadgetDescriptions = brawler.gadgets.reduce((d, g) => ({
        ...d,
        [g.name.toUpperCase()]: g.description,
      }), {} as Record<string, string>)
      Object.assign(gadgetDescriptions, starlistGadgetDescriptions)
    }

    const rarityMap: Record<RARITY, string> = {
      common: 'Common',
      epic: 'Epic',
      legendary: 'Legendary',
      mega_epic: 'Mythic',
      super_rare: 'Super Rare',
    }
    const rarity = characterUnlockCard == undefined ? undefined :
      characterUnlockCard.dynamicRarityStartSeason != null ? 'Chromatic' : rarityMap[characterUnlockCard.rarity]

    return {
      id,
      scId: character.scId,
      name: character.itemName,
      speed: character.speed / 300,
      health: character.hitpoints,
      offenseRating: character.offenseRating,
      defenseRating: character.defenseRating,
      utilityRating: character.utilityRating,
      description: characterDescription,
      rarity: rarity || brawler?.rarity.name,
      class: brawler?.class.name,
      unlock: brawler?.unlock,

      main: {
        cooldown: mainSkill.cooldown * 2,
        rechargeTime: mainSkill.rechargeTime,
        damage: mainSkill.damage != null ? mainSkill.damage : null,
        damageCount: mainSkill.numBulletsInOneAttack,
        damageLabel: mainCard.powerNumberTID,
        description: mainDescription,
        range: mainSkill.castingRange != null ? mainSkill.castingRange / 3 : null,
        charges: mainSkill.maxCharge,
        spread: mainSkill.spread,
      },
      super: {
        cooldown: superSkill.cooldown * 2,
        rechargeTime: superSkill.rechargeTime,
        damage: superSkill.damage != null ? superSkill.damage : null,
        damageCount: superSkill.numBulletsInOneAttack,
        damageLabel: superCard.powerNumberTID,
        description: superDescription,
        range: superSkill.castingRange != null ? superSkill.castingRange / 3 : null,
        charges: superSkill.maxCharge,
        spread: superSkill.spread,
      },
      starpowerDescriptions,
      gadgetDescriptions,
    } as BrawlerData
  }

  public async getStarpower(id: number, accept: string): Promise<Buffer|null> {
    try {
      const path = assetDir + '/star_powers/' + id + '.png';
      await fs.promises.access(path);
      return fs.promises.readFile(path);
    } catch (err) {
      console.log('Starpower not found (local): ' + id);
    }

    let brawlers: StarlistBrawler[];

    try {
      brawlers = (await this.getStarlistBrawlers()).list;
    } catch(err) {
      console.log('Starpower API error: ' + err);
      return null;
    }

    const starpowers = brawlers
      .map(b => b.starPowers)
      .reduce((agg, cur) => agg.concat(...cur), []);
    const starpower = starpowers.find(s => s.id == id);
    if (starpower == undefined) {
      console.log('Starpower not found (starlist): ' + id);
      return null;
    }

    const url = starpower.imageUrl;
    try {
      return await fetch(url, { headers: { accept } })
      .then(res => res.buffer());
    } catch (err) {
      console.log('Starpower fetch error: ' + err);
      return null;
    }
  }

  public async getGadget(id: number, accept: string): Promise<Buffer|null> {
    try {
      const path = assetDir + '/gadgets/' + id + '.png';
      await fs.promises.access(path);
      return fs.promises.readFile(path);
    } catch (err) {
      console.log('Gadget not found (local): ' + id);
    }

    let brawlers: StarlistBrawler[];

    try {
      brawlers = (await this.getStarlistBrawlers()).list;
    } catch(err) {
      console.log('Gadget API error: ' + err);
      return null;
    }

    const gadgets = brawlers
      .map(b => b.gadgets)
      .reduce((agg, cur) => agg.concat(...cur), []);
    const gadget = gadgets.find(g => g.id == id);
    if (gadget == undefined) {
      console.log('Gadget not found (starlist): ' + id);
      return null;
    }

    const url = gadget.imageUrl;
    try {
      return await fetch(url, { headers: { accept } })
      .then(res => res.buffer());
    } catch (err) {
      console.log('Gadget fetch error: ' + err);
      return null;
    }
  }

  public async getMap(id: number, accept: string): Promise<Buffer|null> {
    try {
      const path = assetDir + '/map_images/' + id.toString().replace(/^1500/g, '150') + '.png';
      await fs.promises.access(path);
      return fs.promises.readFile(path);
    } catch (err) {
      console.log('Map not found (local): ' + id);
    }

    let map: { map: StarlistMap };
    try {
      map = await this.getStarlistMap(id);
    } catch(err) {
      console.log('Map API error: ' + err);
      return null;
    }

    const url = map.map.imageUrl;
    try {
      return await fetch(url, { headers: { accept } })
        .then(res => res.buffer());
    } catch (err) {
      console.log('Map fetch error: ' + err);
      return null;
    }
  }

  public async getModeIcon(name: string, accept: string): Promise<Buffer|null> {
    try {
      const path = assetDir + '/modes/icon/' + name + '.png';
      await fs.promises.access(path);
      return fs.promises.readFile(path);
    } catch (err) {
      console.log('Mode not found (local): ' + name);
    }

    let modes: StarlistMode[];

    try {
      modes = (await this.getStarlistModes()).list;
    } catch(err) {
      console.log('Modes API error: ' + err);
      return null;
    }

    const mode = modes.find(m => m.name.replace(/ /g, '').toLowerCase() == name.replace(/ |solo/g, '').toLowerCase());
    if (mode == undefined) {
      console.log('Mode not found (starlist): ' + name);
      return null;
    }

    const url = mode.imageUrl;
    try {
      return await fetch(url, { headers: { accept } })
        .then(res => res.buffer());
    } catch (err) {
      console.log('Mode fetch error: ' + err);
      return null;
    }
  }

  public async getModeBackground(name: string, accept: string): Promise<Buffer|null> {
    try {
      const path = assetDir + '/modes/background/' + name + '.png';
      await fs.promises.access(path);
      return fs.promises.readFile(path);
    } catch (err) {
      console.log('Mode not found (local): ' + name);
    }

    let modes: StarlistMode[];

    try {
      modes = (await this.getStarlistModes()).list;
    } catch(err) {
      console.log('Modes API error: ' + err);
      return null;
    }

    const mode = modes.find(m => m.name.replace(/ /g, '').toLowerCase() == name.replace(/ |solo/g, '').toLowerCase());
    if (mode == undefined) {
      console.log('Mode not found (starlist): ' + name);
      return null;
    }

    const url = mode.imageUrl2;
    try {
      return await fetch(url, { headers: { accept } })
        .then(res => res.buffer());
    } catch (err) {
      console.log('Mode fetch error: ' + err);
      return null;
    }
  }

  public async getAvatarIcon(id: string, accept: string): Promise<Buffer|null> {
    let icons: Record<string, StarlistIcon>;

    try {
      icons = (await this.getStarlistIcons()).player;
    } catch(err) {
      console.log('Icons API error: ' + err);
      return null;
    }

    const icon = icons[id]
    if (icon == undefined) {
      console.log('Icon not found (starlist): ' + id);
      return null;
    }

    const url = icon.imageUrl;
    try {
      return await fetch(url, { headers: { accept } })
        .then(res => res.buffer());
    } catch (err) {
      console.log('Icon fetch error: ' + err);
      return null;
    }
  }

  private getStarlistBrawlers(): Promise<{ list: StarlistBrawler[] }> {
    return request(starlistUrl + '/brawlers');
  }

  private getStarlistMaps(): Promise<{ list: StarlistMap[] }> {
    return request(starlistUrl + '/maps');
  }

  private getStarlistMap(id: number): Promise<{ map: StarlistMap }> {
    return request(starlistUrl + '/maps/' + id);
  }

  private getStarlistModes(): Promise<{ list: StarlistMode[] }> {
    return request(starlistUrl + '/gamemodes');
  }

  private getStarlistIcons(): Promise<{ player: Record<string, StarlistIcon> }> {
    return request(starlistUrl + '/icons');
  }

  private async getStarlistBrawler(name: string): Promise<StarlistBrawler|null> {
    let brawlers: StarlistBrawler[];
    try {
      brawlers = (await this.getStarlistBrawlers()).list;
    } catch (err) {
      console.log('Brawler API error: ' + err);
      return null;
    }

    const convert = (name: string) => name.toLowerCase().replace(/[^a-z]/g, '');
    return brawlers.find(b => convert(b.name) == convert(name)) || null;
  }
}
