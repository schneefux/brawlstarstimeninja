import ClickHouse from '@apla/clickhouse';
import { ClickHouse as ClickHouse2 } from 'clickhouse';
import StatsD from 'hot-shots'
import { Player, BattleLog, BattlePlayer } from '~/model/Brawlstars';
import { performance } from 'perf_hooks';
import { MapMetaRow, LeaderboardRow, BrawlerLeaderboardRow } from '~/model/Clicker';
import { parseApiTime, idToTag, tagToId, validateTag, getSeasonEnd, formatClickhouse, getCurrentSeasonEnd, formatClickhouseDate } from '../lib/util';
import MapMetaCube from './cubes/MapMetaCube';
import GadgetMetaCube from './cubes/GadgetMetaCube';
import StarpowerMetaCube from './cubes/StarpowerMetaCube';
import LeaderboardCube from './cubes/LeaderboardCube';
import BrawlerLeaderboardCube from './cubes/BrawlerLeaderboardCube';
import SynergyMetaCube from './cubes/SynergyCube';
import PlayerBrawlerCube from './cubes/PlayerBrawlerCube';
import PlayerBattleCube from './cubes/PlayerBattleCube';
import Cube, { Order } from './cubes/Cube';
import { TeamCube } from './cubes/TeamCube';

const dbHost = process.env.CLICKHOUSE_HOST || ''
const stats = new StatsD({ prefix: 'brawltime.clicker.' })
const balanceChangesDate = new Date(Date.parse(process.env.BALANCE_CHANGES_DATE || '2020-07-01'))
const seasonSliceStart = getSeasonEnd(balanceChangesDate);

console.log(`querying data >= ${seasonSliceStart}`)

export default class ClickerService {
  // readonly
  private chRo: ClickHouse2;
  // readwrite
  private chRw: ClickHouse2;

  private playerBrawlerCube: PlayerBrawlerCube
  private playerBattleCube: PlayerBattleCube
  private mapMetaCube: MapMetaCube
  private gadgetMetaCube: GadgetMetaCube
  private starpowerMetaCube: StarpowerMetaCube
  private synergyMetaCube: SynergyMetaCube
  private leaderboardCube: LeaderboardCube
  private brawlerLeaderboardCube: BrawlerLeaderboardCube
  private teamCube: TeamCube

  constructor() {
    this.chRw = new ClickHouse2({
      url: dbHost,
      isSessionPerQuery: true,
    })
    // use 1 thread -> server can handle more queries
    // player queries take about 25% longer than with 4 threads
    this.chRo = new ClickHouse2({
      url: dbHost,
      config: {
        readonly: 1,
        max_threads: 1,
        output_format_json_quote_64bit_integers: 1,
      },
      // clickhouse allows only a single query per session!
      isSessionPerQuery: true,
    })

    this.playerBrawlerCube = new PlayerBrawlerCube(this.chRo)
    this.playerBattleCube = new PlayerBattleCube(this.chRo)
    this.mapMetaCube = new MapMetaCube(this.chRo)
    this.gadgetMetaCube = new GadgetMetaCube(this.chRo)
    this.starpowerMetaCube = new StarpowerMetaCube(this.chRo)
    this.synergyMetaCube = new SynergyMetaCube(this.chRo)
    this.leaderboardCube = new LeaderboardCube(this.chRo)
    this.brawlerLeaderboardCube = new BrawlerLeaderboardCube(this.chRo)
    this.teamCube = new TeamCube(this.synergyMetaCube, this.mapMetaCube, this.chRo)
  }

  private insert(sql: string, callback: (error?: Error) => void) {
    // only this client supports JSON insert streams
    // this client has no support for sessions
    // => create a new client = create a new session
    const ch = new ClickHouse(dbHost)
    return ch.query(sql, { format: 'JSONEachRow' }, callback)
  }

  // ro query
  private async query<T>(query: string, metricName: string): Promise<T[]> {
    stats.increment(metricName + '.run')
    return stats.asyncTimer(() =>
      this.chRo.query(query).toPromise() as Promise<T[]>
    , metricName + '.timer')()
  }

  // rw query
  private async exec(query: string): Promise<any[]> {
    return await this.chRw.query(query).toPromise()
  }

  public async migrate() {
    await this.exec('CREATE DATABASE IF NOT EXISTS brawltime')

    await this.playerBattleCube.up(this.chRw)
    await this.playerBrawlerCube.up(this.chRw)
    await this.mapMetaCube.up(this.chRw)
    await this.gadgetMetaCube.up(this.chRw)
    await this.starpowerMetaCube.up(this.chRw)
    await this.synergyMetaCube.up(this.chRw)
    await this.leaderboardCube.up(this.chRw)
    await this.brawlerLeaderboardCube.up(this.chRw)
    await this.teamCube.up(this.chRw)
  }

  public async store(entry: { player: Player, battleLog: BattleLog }) {
    const player = entry.player
    player.tag = validateTag(player.tag)

    // parse dates
    const battles = entry.battleLog.items.map(battle => ({
      ...battle,
      battleTime: parseApiTime(battle.battleTime),
    }))

    // TODO maybe put this into redis to avoid slow blocking point queries
    const maxTimestamp = await this.query<any>(
      `SELECT formatDateTime(MAX(timestamp), '%FT%TZ', 'UTC') AS maxTimestamp FROM brawltime.battle WHERE trophy_season_end>=toDateTime('${formatClickhouse(seasonSliceStart)}', 'UTC') AND player_id=${tagToId(player.tag)}`,
      'player.get_last')
    // if not found, clickhouse max() defaults to 0000 date (Date.parse returns NaN)
    // changed to 1970 in 20.7
    const lastBattleTimestamp = (maxTimestamp[0].maxTimestamp.startsWith('0000') || maxTimestamp[0].maxTimestamp.startsWith('1970')) ? seasonSliceStart : new Date(Date.parse(maxTimestamp[0].maxTimestamp))

    const battleInsertStart = performance.now()
    const battleStream = this.insert('INSERT INTO brawltime.battle', (error) => {
      stats.timing('player.insert.timer', performance.now() - battleInsertStart)
      if (error) {
        stats.increment('player.insert.error')
        console.error(`error inserting battle for ${player.tag} (${tagToId(player.tag)}): ${error}`)
      }
    })

    const playerFacts = {
      player_id: tagToId(player.tag),
      player_tag: player.tag,
      player_name: player.name,
      player_name_color: player.nameColor,
      player_icon_id: player.icon.id,
      player_trophies: player.trophies,
      player_highest_trophies: player.highestTrophies,
      player_power_play_points: player.powerPlayPoints,
      player_highest_power_play_points: player.highestPowerPlayPoints,
      player_exp_points: player.expPoints,
      player_is_qualified_from_championship_challenge: player.isQualifiedFromChampionshipChallenge,
      player_3vs3_victories: player['3vs3Victories'],
      player_solo_victories: player.soloVictories,
      player_duo_victories: player.duoVictories,
      player_best_robo_rumble_time: player.bestRoboRumbleTime,
      player_best_time_as_big_brawler: player.bestTimeAsBigBrawler,
      // calculated
      player_brawlers_length: player.brawlers.length,
      /* player club */
      player_club_id: player.club?.tag != undefined ? tagToId(player.club.tag) : undefined,
      player_club_tag: player.club?.tag,
      player_club_name: player.club?.name,
    }

    // insert records for meta stats
    for (const battle of battles) {
      stats.increment('player.insert.prepare')

      // note: battle is patched by api service
      if (battle.battle.type == 'friendly') {
        // ignore
        // in friendlies, players can play brawlers without owning them -> myBrawler is undefined
        console.log(`ignoring friendly battle for ${player.tag} (${tagToId(player.tag)})`)
        stats.increment('player.insert.skip')
        continue
      }

      if (battle.event == undefined || battle.event.map == null) {
        console.log(`ignoring battle without event for ${player.tag} (${tagToId(player.tag)})`)
        stats.increment('player.insert.skip')
        continue
      }

      if (battle.battleTime <= lastBattleTimestamp) {
        // duplicate
        console.log(`ignoring old battle (${battle.battleTime.toISOString()} <= ${lastBattleTimestamp.toISOString()}) for ${player.tag} (${tagToId(player.tag)})`)
        stats.increment('player.insert.skip')
        continue
      }

      const teamsWithoutBigBrawler = (battle.battle.teams !== undefined ? battle.battle.teams : battle.battle.players!.map((p) => [p]))
      const teams = battle.battle.bigBrawler !== undefined ? teamsWithoutBigBrawler.concat([[battle.battle.bigBrawler]]) : teamsWithoutBigBrawler

      const myTeamIndex = teams.findIndex(t => t.find(p => p.tag == player.tag))
      if (myTeamIndex == -1) {
        console.log(`ignoring bot battle for ${player.tag} (${tagToId(player.tag)})`)
        stats.increment('player.insert.skip')
        continue // replaced by bot?
      }

      const myTeam = teams[myTeamIndex]
      const myIndex = myTeam.findIndex(p => p.tag == player.tag)
      const me = myTeam[myIndex]
      const myBrawler = player.brawlers.find((b) => b.name == me.brawler.name)!
      const myStarpower = myBrawler.starPowers.length != 1 ? null : myBrawler.starPowers[0]
      const myGadget = myBrawler.gadgets.length != 1 ? null : myBrawler.gadgets[0]
      const floatingVictory =
          battle.battle.result == 'victory' ? 1.0
        : battle.battle.result == 'defeat' ? 0.0
        : battle.battle.result == 'draw' ? 0.5
        : 'rank' in battle.battle ? 1 - (battle.battle.rank! - 1) / (teams.length - 1)
        : null

      const trophyRange = Math.floor(me.brawler.trophies / 100)

      const allies = myTeam.filter(p => p.tag !== player.tag)
      const enemies = (<BattlePlayer[]>[]).concat(...teams.filter(t => t !== myTeam))

      const isPowerplay = floatingVictory != null && battle.battle.trophyChange != null
        // all brawlers use a star power
        && allies.every(a => a.brawler.power == 10) && enemies.every(a => a.brawler.power == 10)
        // victory
        //   - regular battles give +11 max (+10 +3 underdog) on victory
        //   - power play at least 18
        // draw
        //   - regular battles +3 max (0 +3 underdog)
        //   - power play 18 or 15
        // defeat
        //   - regular battles max +3 (0 +3 underdog) in Showdown <50 trophies
        //   - power play at least 2
        //   - this is not 100% accurate but a collision is unlikely
        // https://brawlstars.fandom.com/wiki/Power_Play
        // https://brawlstars.fandom.com/wiki/Trophies
        && (floatingVictory > 0.5 && battle.battle.trophyChange >= 15
          || floatingVictory == 0.5 && battle.battle.trophyChange >= 5
          || floatingVictory < 0.5 && battle.battle.trophyChange >= 2)
      // retroactively applied on 2020-09-20T11:45 with
      // alter table battle update battle_event_powerplay=1 where player_highest_power_play_points>0 and brawler_power=10 and (battle_victory>toDecimal32(0.5, 8) and battle_trophy_change>=15 or battle_victory=toDecimal32(0.5, 8) and battle_trophy_change>=5 or battle_victory<toDecimal32(0.5, 8) and battle_trophy_change>=2)

      const record = {
        timestamp: battle.battleTime,
        trophy_season_end: getSeasonEnd(battle.battleTime),
        ...playerFacts,
        /* player brawler */
        // see other table
        /* brawler */
        brawler_id: myBrawler.id,
        brawler_name: myBrawler.name || 'NANI', // FIXME API bug 2020-06-06
        brawler_power: me.brawler.power,
        brawler_trophies: me.brawler.trophies,
        brawler_highest_trophies: myBrawler.highestTrophies,
        // calculated
        brawler_trophyrange: trophyRange,
        /* brawler starpower */
        brawler_starpower_found: myStarpower !== null,
        brawler_starpower_id: myStarpower?.id,
        brawler_starpower_name: myStarpower?.name,
        /* brawler gadget */
        brawler_gadget_found: myGadget !== null,
        brawler_gadget_id: myGadget?.id,
        brawler_gadget_name: myGadget?.name,
        /* starpowers (nested) */
        'brawler_starpowers.id': myBrawler?.starPowers.map(sp => sp.id),
        'brawler_starpowers.name': myBrawler?.starPowers.map(sp => sp.name),
        brawler_starpowers_length: myBrawler?.starPowers.length,
        /* gadgets (nested) */
        'brawler_gadgets.id': myBrawler?.gadgets.map(g => g.id),
        'brawler_gadgets.name': myBrawler?.gadgets.map(g => g.name),
        brawler_gadgets_length: myBrawler?.gadgets.length,
        /* battle event */
        battle_event_id: battle.event.id,
        battle_event_mode: battle.event.mode,
        battle_event_map: battle.event.map,
        battle_event_powerplay: isPowerplay,
        /* battle */
        // mode: ommitted because duplicate
        battle_type: battle.battle.type,
        battle_result: battle.battle.result,
        battle_duration: battle.battle.duration,
        battle_rank: battle.battle.rank,
        battle_trophy_change: battle.battle.trophyChange,
        battle_level_name: battle.battle.level?.name,
        battle_level_id: 'level' in battle.battle ? battle.battle.level?.id : null,
        // calculated
        battle_victory: floatingVictory == null ? null : Math.floor(floatingVictory * 10e7) / 10e7, // Decimal(8)
        /* battle starplayer */
        battle_starplayer_brawler_id: battle.battle.starPlayer?.brawler.id,
        battle_starplayer_brawler_name: battle.battle.starPlayer?.brawler.name,
        battle_starplayer_brawler_power: battle.battle.starPlayer?.brawler.power,
        battle_starplayer_brawler_trophies: battle.battle.starPlayer?.brawler.trophies,
        // calculated
        battle_is_starplayer: 'starPlayer' in battle.battle ? battle.battle.starPlayer?.tag === player.tag : null,
        /* battle big brawler */
        battle_bigbrawler_brawler_id: battle.battle.bigBrawler?.brawler.id,
        battle_bigbrawler_brawler_name: battle.battle.bigBrawler?.brawler.name,
        battle_bigbrawler_brawler_power: battle.battle.bigBrawler?.brawler.power,
        battle_bigbrawler_brawler_trophies: battle.battle.bigBrawler?.brawler.trophies,
        // calculated
        battle_is_bigbrawler: 'bigBrawler' in battle.battle ? battle.battle.bigBrawler?.tag == player.tag : null,
        /* battle allies (nested) */
        'battle_allies.brawler_id': allies.map(a => a.brawler.id),
        'battle_allies.brawler_name': allies.map(a => a.brawler.name),
        'battle_allies.brawler_power': allies.map(a => a.brawler.power),
        'battle_allies.brawler_trophies': allies.map(a => a.brawler.trophies),
        /* battle enemies (nested) */
        'battle_enemies.brawler_id': enemies.map(e => e.brawler.id),
        'battle_enemies.brawler_name': enemies.map(e => e.brawler.name),
        'battle_enemies.brawler_power': enemies.map(e => e.brawler.power),
        'battle_enemies.brawler_trophies': enemies.map(e => e.brawler.trophies),
      }

      // to debug encoding errors:
      // console.log(require('@apla/clickhouse/src/process-db-value').encodeRow(record, (<any>stream).format))
      await new Promise((resolve, reject) => {
        stats.increment('player.insert.run')
        if (battleStream.write(record)) {
          return resolve()
        }

        stats.increment('player.insert.buffering')
        battleStream.once('drain', (err) => {
          if (err) {
            stats.increment('player.insert.error')
            console.error(`error inserting battle for ${player.tag} (${tagToId(player.tag)})`, record, err)
            return reject(err)
          }

          return resolve()
        })
      })
    }

    battleStream.end()

    const brawlerInsertStart = performance.now()
    const brawlerStream = this.insert('INSERT INTO brawltime.brawler', (error) => {
      stats.timing('brawler.insert.timer', performance.now() - brawlerInsertStart)
      if (error) {
        stats.increment('brawler.insert.error')
        console.error(`error inserting brawler for ${player.tag} (${tagToId(player.tag)}): ${error}`)
      }
    })

    for (const brawler of player.brawlers) {
      stats.increment('brawler.insert.prepare')

      const record = {
        timestamp: formatClickhouseDate(new Date()),
        trophy_season_end: getCurrentSeasonEnd(), // will be formatted by node-clickhouse
        ...playerFacts,
        brawler_id: brawler.id,
        brawler_name: brawler.name || 'NANI', // FIXME API bug 2020-06-06
        brawler_power: brawler.power,
        brawler_trophies: brawler.trophies,
        brawler_highest_trophies: brawler.highestTrophies,
        /* starpowers (nested) */
        'brawler_starpowers.id': brawler.starPowers.map(sp => sp.id),
        'brawler_starpowers.name': brawler.starPowers.map(sp => sp.name),
        brawler_starpowers_length: brawler.starPowers.length,
        /* gadgets (nested) */
        'brawler_gadgets.id': brawler.gadgets.map(g => g.id),
        'brawler_gadgets.name': brawler.gadgets.map(g => g.name),
        brawler_gadgets_length: brawler.gadgets.length,
      }

      await new Promise((resolve, reject) => {
        stats.increment('brawler.insert.run')
        if (brawlerStream.write(record)) {
          return resolve()
        }

        stats.increment('brawler.insert.buffering')
        brawlerStream.once('drain', (err) => {
          if (err) {
            stats.increment('brawler.insert.error')
            console.error(`error inserting brawler for ${player.tag} (${tagToId(player.tag)})`, record, err)
            return reject(err)
          }

          return resolve()
        })
      })
    }

    brawlerStream.end()
  }

  public async getTopByMetric(metric: string, limit: number) {
    const metrics = {
      'expPoints': 'player_exp_points',
      'trophies': 'player_trophies',
      'powerPlayPoints': 'player_power_play_points',
      'victories': 'player_3vs3_victories',
      'soloVictories': 'player_solo_victories',
      'duoVictories': 'player_duo_victories',
    }

    const metricMeasure = ((<any>metrics)[metric] || metric) as any
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const rows = await this.leaderboardCube.query(
      'leaderboard',
      [metricMeasure, 'player_name', 'player_icon_id'],
      ['player_id'],
      {
        'timestamp': [formatClickhouse(oneWeekAgo)],
      },
      { [metricMeasure]: 'desc' },
      limit,
    )

    return rows.data.map(r => (<Partial<LeaderboardRow>>{
      name: r.player_name,
      tag: idToTag(r.player_id as string).replace('#', ''),
      id: r.player_id,
      icon: r.player_icon_id,
      [metric]: r[metricMeasure],
    }))
  }

  public async getTopBrawlerByMetric(brawlerId: string, metric: string, limit: number) {
    const metrics = {
      'trophies': 'brawler_trophies',
      'highestTrophies': 'brawler_highest_trophies',
    }

    if (isNaN(parseInt(brawlerId))) {
      console.error('invalid brawlerId', brawlerId)
      return []
    }

    const metricMeasure = ((<any>metrics)[metric] || metric) as any
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const rows = await this.brawlerLeaderboardCube.query(
      'brawler_leaderboard',
      [metricMeasure, 'player_name'],
      ['player_id'],
      {
        'timestamp': [formatClickhouse(oneWeekAgo)],
      },
      { [metricMeasure]: 'desc' },
      limit,
    )

    return rows.data.map(r => (<Partial<BrawlerLeaderboardRow>>{
      name: r.player_name,
      brawlerName: r.brawler_name,
      tag: idToTag(r.player_id as string).replace('#', ''),
      id: r.player_id,
      icon: r.player_icon_id,
      [metric]: r[metricMeasure],
    }))
  }

  public async getMapMeta(trophyrangeLower: string, trophyrangeHigher: string) {
    const rows = await this.mapMetaCube.query(
      'meta.map',
      ['*'],
      ['brawler_name', 'battle_event_mode', 'battle_event_map', 'battle_event_id', 'battle_is_bigbrawler'],
      {
        'brawler_trophyrange': [trophyrangeLower, trophyrangeHigher],
        'trophy_season_end': ['balance'],
      },
      { 'picks': 'asc' },
    )

    return rows.data.map(r => (<MapMetaRow>{
      brawlerName: r.brawler_name,
      duration: r.battle_duration,
      id: r.battle_event_id,
      isBigbrawler: r.battle_is_bigbrawler,
      level: r.battle_level,
      map: r.battle_event_map,
      mode: r.battle_event_mode,
      picks: r.picks,
      picksWeighted: r.picks_weighted,
      rank: r.battle_rank,
      rank1Rate: r.battle_rank1,
      starRate: r.battle_starplayer,
      timestamp: r.timestamp,
      trophyChange: r.battle_trophy_change,
      winRate: r.battle_victory,
    }))
  }


  private getCubeByName(cubeName: string): Cube {
    switch (cubeName) {
      // raw cubes
      case 'battle':
        return this.playerBattleCube
      case 'brawler':
        return this.playerBrawlerCube
      // materialized cubes
      case 'player':
        return this.leaderboardCube
      case 'player_brawler':
        return this.brawlerLeaderboardCube
      case 'map':
        return this.mapMetaCube
      case 'synergy':
        return this.synergyMetaCube
      case 'gadget':
        return this.gadgetMetaCube
      case 'starpower':
        return this.starpowerMetaCube
      // virtual cubes
      case 'team':
        return this.teamCube
      default:
        throw new Error('Invalid cube: ' + cubeName)
    }
  }

  public getCubeMetadata(cubeName: string) {
    const cube = this.getCubeByName(cubeName)
    return {
      dimensions: cube.dimensions,
      measures: Object.keys(cube.measures),
      slices: cube.slices,
    }
  }

  public async queryCube(cubeName: string,
      measures: string[],
      dimensions: string[],
      slices: { [name: string]: string[] },
      order: { [column: string]: Order },
      limit: number,
      name: string|undefined,
      format: string|undefined) {
    const cube = this.getCubeByName(cubeName)
    limit = Math.min(1000, limit)

    console.log('executing cube query ' + name, cubeName, measures, dimensions, slices, order, limit, format)
    const data = await cube.query(
      name || 'cube.' + cubeName + '.' + dimensions.join(','),
      measures,
      dimensions,
      slices,
      order,
      limit,
    )

    switch (format) {
      case 'data':
        return data.data
      case 'first':
        return data.data[0]
      case 'totals':
        return data.totals
      case 'csv':
        const attrs = [...new Set([...dimensions, ...measures, ...Object.keys(order)])]
        return attrs.join(',') + '\n'
          + data.data.map(row => attrs.map(a => row[a]).join(',')).join('\n')
      default:
        return data
    }
  }
}
