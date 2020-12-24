import { differenceInMinutes, parseISO } from "date-fns"
import { brawlerId, capitalizeWords, dimensionMap, sliceMap, formatMode, measurementMap, measurementOfTotal, MetaGridEntry, metaStatMaps } from "~/lib/util"
import { CurrentAndUpcomingEvents } from "~/model/Api"
import { Route, Location } from "vue-router"

const cubes = ['player', 'brawler', 'map', 'synergy', 'starpower', 'gadget']

export interface PicksWins {
  picks: number
  wins: number
}

export interface TeamPicksWins extends PicksWins {
  brawlers: string[]
}

export interface EventMetadata {
  battle_event_id: number
  battle_event_map: string
  battle_event_mode: string
  battle_event_powerplay: boolean
  timestamp: string
  picks: number
  start?: string
  end?: string
}

export interface Slices extends Record<string, string[]|undefined> {}

interface Clicker {
  timePresets: Record<string, string>
  defaultSlices(cube: string): Record<string, string[]>
  cubes: typeof cubes[number][]
  queryMetadata(cube: typeof cubes[number]): Promise<{ dimensions: string[], measures: string[], slices: Record<string, number> }>
  query<T=any>(
    name: string,
    cube: typeof cubes[number],
    dimensions: string[],
    measures: string[],
    slices: Slices,
    options: {
      sort?: Record<string, string>,
      limit?: number,
      cache?: number,
    }): Promise<{ data: T[], totals: T, statistics: Record<string, number> }>
  queryActiveEvents(): Promise<EventMetadata[]>,
  queryActiveEvents<T extends EventMetadata>(measures: string[], slices: Slices, maxage: number): Promise<T[]>,
  queryAllModes(): Promise<string[]>
  queryAllMaps(mode?: string): Promise<string[]>
  queryAllBrawlers(): Promise<string[]>
  describeSlices(slices: Slices, timestamp?: string): string
  calculateBayesSynergies(tag: string, brawler?: string, limit?: number): Promise<{
    sampleSize: number,
    timestamp: string,
    // H
    totals: PicksWins,
    // H(brawler)
    data: Map<string, PicksWins>,
    // H(ally_brawler,brawler)
    pairData: Map<string, Map<string, PicksWins>>,
  }>
  routeToSlices(route: Route, defaults?: Slices): Record<string, string[]>
  slicesToLocation(slices: Slices, defaults?: Slices): Location
  constructQuery(dimensions: string[], measurements: string[], slices: Record<string, string[]>): { dimensions: string[], measurements: string[], slices: Record<string, string[]> }
  mapToMetaGridEntry(dimensions: string[], measurements: string[], rows: any[], totals: any, diffDimension?: string): MetaGridEntry[]
  compareEntries(baseEntries: MetaGridEntry[], comparingEntries: MetaGridEntry[]): MetaGridEntry[]
}

declare module 'vue/types/vue' {
  interface Vue {
    $clicker: Clicker
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $clicker: Clicker
  }
  interface Context {
    $clicker: Clicker
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $clicker: Clicker
  }
}

export default (context, inject) => {
  inject('clicker', <Clicker>{
    timePresets: {
      'current': 'Season',
      'balance': 'Update',
      'month': 'Month',
    } as Record<string, string>,
    defaultSlices(cube) {
      switch (cube) {
        case 'map':
          return {
            trophy_season_end: ['balance'],
            battle_event_powerplay: ['false'],
          }
        case 'battle':
          return {
            trophy_season_end: ['month'],
          }
        case 'brawler':
          return {
          }
        case 'synergy':
          return {
            trophy_season_end: ['balance'],
            ally_brawler_name: ['SHELLY'],
          }
        default:
          return {
            trophy_season_end: ['balance'],
          }
      }
    },
    cubes,
    queryMetadata(cube) {
      return context.$axios.$get(context.env.clickerUrl + '/clicker/cube/' + cube + '/metadata')
    },
    query(name, cube, dimensions, measures, slices, options = {}) {
      const query = new URLSearchParams({
        include: measures.join(','),
      })
      const headers = {} as Record<string, string>
      if (options.sort != undefined) {
        query.append('sort', Object.entries(options.sort || {}).map(([name, order]) => (order == 'desc' ? '-' : '') + name).join(','))
      }
      if (options.limit != undefined) {
        query.append('limit', options.limit.toString())
      }
      if (name != undefined) {
        headers['x-brawltime-tag'] = name
      }
      if (options.cache != undefined) {
        headers['x-brawltime-cache'] = options.cache.toString()
      }
      Object.entries(slices)
        .filter(([name, args]) => args != undefined)
        .forEach(([name, args]) => query.append('slice[' + name + ']', args!.join(',')))
      query.sort()
      const url = context.env.clickerUrl + '/clicker/cube/' + cube + '/query/' + dimensions.join(',') + '?' + query.toString()
      console.log(`querying clicker: cube=${cube}, dimensions=${JSON.stringify(dimensions)}, measures=${JSON.stringify(measures)}, slices=${JSON.stringify(slices)} name=${name} (${url})`)
      return context.$axios.$get(url, { headers })
    },
    async queryActiveEvents(measures = [], slices = {}, maxage = 60) {
      const events = await this.query<EventMetadata>('active.events', 'map',
        ['battle_event_mode', 'battle_event_map', 'battle_event_id', 'battle_event_powerplay'],
        ['battle_event_mode', 'battle_event_map', 'battle_event_id', 'battle_event_powerplay', 'timestamp', 'picks', ...measures],
        {
          trophy_season_end: ['current'],
          ...slices,
        },
        {
          sort: { timestamp: 'desc' },
          cache: 60*10,
          limit: 10,
        })

      const lastEvents = events.data
        .filter(e => differenceInMinutes(new Date(), parseISO(e.timestamp)) <= maxage)
        .sort((e1, e2) => e2.picks - e1.picks)

      const starlistData = await context.$axios.$get('/api/events/active')
        .catch(() => ({ current: [], upcoming: [] })) as CurrentAndUpcomingEvents
      starlistData.current.forEach(s => {
        const match = lastEvents.find(e => e.battle_event_id.toString() == s.id)
        if (match) {
          match.start = s.start
          match.end = s.end
        }
      })

      return lastEvents
    },
    async queryAllModes() {
      const modes = await this.query<{ battle_event_mode: string }>('all.modes', 'map',
        ['battle_event_mode'],
        ['battle_event_mode'],
        { trophy_season_end: ['balance'] },
        { sort: { picks: 'desc' }, cache: 60*60 })
      return modes.data.map(row => row.battle_event_mode)
    },
    async queryAllMaps(mode?: string) {
      const maps = await this.query<{ battle_event_map: string }>('all.maps', 'map',
        ['battle_event_map'],
        ['battle_event_map'],
        {
          trophy_season_end: ['balance'],
          ...(mode != undefined ? {
            battle_event_mode: [mode],
          } : {})
        },
        { sort: { picks: 'desc' }, cache: 60*60 })
      return maps.data.map(m => m.battle_event_map)
    },
    async queryAllBrawlers() {
      const brawlers = await this.query<{ brawler_name: string }>('all.brawlers', 'map',
        ['brawler_name'],
        ['brawler_name'],
        { trophy_season_end: ['balance'] },
        { sort: { picks: 'desc' }, cache: 60*60 })
      return brawlers.data.map(b => b.brawler_name)
    },
    describeSlices(slices: Record<string, string[]>, timestamp?: string) {
      let description: string[] = []

      const powerplay = 'battle_event_powerplay' in slices && slices.battle_event_powerplay[0] == 'true'

      if ('battle_event_mode' in slices) {
        let mapName = formatMode(slices.battle_event_mode[0])
        if ('battle_event_map' in slices) {
          mapName += ' - ' + slices.battle_event_map[0]
        }
        if (powerplay) {
          mapName += ' (Power Play)'
        }
        description.push(mapName)
      } else {
        if (powerplay) {
          description.push('Power Play')
        }
      }

      if ('brawler_trophyrange' in slices) {
        let trophyName = ''
        if (slices.brawler_trophyrange[0] == '0' && slices.brawler_trophyrange[1] == '10') {
          trophyName = 'all '
        } else {
          const lower = slices.brawler_trophyrange[0] + '00'
          const upper = slices.brawler_trophyrange[1] == '10' ? '+' : ('-' + slices.brawler_trophyrange[1] + '00')
          trophyName = lower + upper + ' '
        }
        trophyName += powerplay ? 'Points' : 'Trophies'
        description.push(trophyName)
      }

      const seasonDescription = {
        balance: 'update',
        month: 'month',
        season: 'season',
      }
      if ('trophy_season_end' in slices && slices.trophy_season_end[0] in seasonDescription) {
        description.push('current ' + seasonDescription[slices.trophy_season_end[0]])
      }

      if (timestamp != undefined) {
        description.push('created ' + parseISO(timestamp).toLocaleDateString())
      }

      return description.join(', ')
    },
    async calculateBayesSynergies(tag: string, brawler?: string, limit?: number) {
      const slices = {
        trophy_season_end: ['balance'],
      }

      // H(ally_brawler,brawler)
      const pairData = await this.query(tag, 'synergy',
        ['brawler_name', 'ally_brawler_name'],
        ['wins', 'picks'],
        {
          ...slices,
          ...(brawler == undefined ? {} : { brawler_name: [brawler.toUpperCase()] }),
        },
        {
          cache: 60*60,
          sort: { wins: 'desc' },
          limit,
        })
      // H(brawler) and H
      const data = await this.query(tag, 'map',
        ['brawler_name'],
        ['wins', 'picks', 'timestamp'],
        slices,
        { cache: 60*60 })

      const totalSampleSize = data.totals.picks
      const totalTimestamp = data.totals.timestamp

      // H(ally_brawler,brawler)
      const pairMap = new Map<string, Map<string, PicksWins>>()
      pairData.data.forEach((row) => {
        if (!pairMap.has(row.brawler_name)) {
          pairMap.set(row.brawler_name, new Map<string, PicksWins>())
        }
        pairMap.get(row.brawler_name)!.set(row.ally_brawler_name, {
          picks: row.picks,
          wins: row.wins,
        })
      })
      // H(brawler)
      const dataMap = new Map<string, PicksWins>()
      data.data.forEach((row) => dataMap.set(row.brawler_name, row))
      // H
      const totals: PicksWins = {
        picks: data.totals.picks,
        wins: data.totals.wins,
      }

      return {
        totals,
        data: dataMap,
        pairData: pairMap,
        sampleSize: totalSampleSize,
        timestamp: totalTimestamp,
      }
    },
    routeToSlices(route, defaults={}) {
      return {
        ...defaults,
        ...('mode' in route.query ? {
          battle_event_mode: [route.query['mode'] as string],
        }: {}),
        ...('map' in route.query ? {
          battle_event_map: [route.query['map'] as string],
        }: {}),
        ...('powerplay' in route.query ? {
          battle_event_powerplay: [route.query['powerplay'] as string],
        } : {}),
        ...('season' in route.query ? {
          trophy_season_end: [route.query['season'] as string],
        } : {}),
        ...('range' in route.query ? {
          brawler_trophyrange: route.query['range'] as string[],
        } : {}),
        ...('ally' in route.query ? {
          ally_brawler_name: [route.query['ally'] as string],
        } : {}),
        ...('name_like' in route.query ? {
          player_name_ilike: [route.query['name_like'] as string],
        } : {}),
      }
    },
    slicesToLocation(slices, defaults={}) {
      const diff = Object.fromEntries(
        Object.entries(slices)
          .filter(([name, params]) => !(name in defaults) || JSON.stringify(defaults[name]) != JSON.stringify(params)
      ))

      const query = {} as Record<string, string[]>
      if ('battle_event_mode' in diff) {
        query['mode'] = diff.battle_event_mode!
      }
      if ('battle_event_map' in diff) {
        query['map'] = diff.battle_event_map!
      }
      if ('battle_event_powerplay' in diff) {
        query['powerplay'] = diff.battle_event_powerplay!
      }
      if ('trophy_season_end' in diff) {
        query['season'] = diff.trophy_season_end!
      }
      if ('brawler_trophyrange' in diff) {
        query['range'] = diff.brawler_trophyrange!
      }
      if ('ally_brawler_name' in diff) {
        query['ally'] = diff.ally_brawler_name!
      }
      if ('player_name_ilike' in diff) {
        query['name_like'] = diff.player_name_ilike!
      }

      return { query }
    },
    constructQuery(dimensions, measurements, slices) {
      const queryDimensions = dimensions.map(d => dimensionMap[d])
      const queryMeasurements = measurements.map(m => measurementMap[m])
      const querySlices = Object.fromEntries(Object.entries(slices)
        .filter(([key, value]) => {
          if (!Array.isArray(value)) {
            throw new Error('Illegal slice specification! ' + { [key]: value })
          }
          return value.length > 0 && value[0] != undefined
        })
        .map(([key, value]) => [sliceMap[key], value]))

      return {
        dimensions: queryDimensions,
        measurements: queryMeasurements,
        slices: querySlices,
      }
    },
    mapToMetaGridEntry(dimensions, measurements, rows, totals) {
      return rows.map(row => {
        const entry: MetaGridEntry = {
          id: '',
          dimensions: {},
          measurements: {},
          measurementsFormatted: {},
        }

        if (dimensions.includes('player')) {
          entry.dimensions.player = {
            tag: row.player_tag,
          }
          if (measurements.includes('player')) {
            entry.dimensions.player.name = row.player_name
          }
        }
        if (dimensions.includes('brawler') || measurements.includes('brawler')) {
          entry.dimensions.brawler = {
            id: brawlerId({ name: row.brawler_name }),
            name: capitalizeWords(row.brawler_name.toLowerCase()),
          }
        }
        if(dimensions.includes('ally') || measurements.includes('ally')) {
          entry.dimensions.ally = {
            id: brawlerId({ name: row.ally_brawler_name }),
            name: capitalizeWords(row.ally_brawler_name.toLowerCase()),
          }
        }
        if (dimensions.includes('brawlers') || measurements.includes('brawlers')) {
          entry.dimensions.brawlers = row.brawler_names.map(b => ({
            id: brawlerId({ name: b }),
            name: capitalizeWords(b.toLowerCase()),
          }))
        }

        entry.id = JSON.stringify(entry.dimensions) // TODO improve performance

        for (const m of measurements) {
          if (typeof row[measurementMap[m]] != 'string') {
            // else: already added to dimensions
            entry.measurements[m] = row[measurementMap[m]] / (measurementOfTotal[m] ? totals[measurementMap[m]] : 1)
            entry.measurementsFormatted[m] = metaStatMaps.formatters[m](entry.measurements[m])
          }
        }

        return entry
      })
    },
    compareEntries(baseEntries: MetaGridEntry[], comparingEntries: MetaGridEntry[]) {
      return comparingEntries
        .map(comparingEntry => {
          // TODO compare all dimensions here
          const baseEntry = baseEntries.find((b: any) => b.brawler.id == (<any>comparingEntry).brawler.id)
          if (baseEntry == undefined) {
            return undefined
          }
          if (!('winRate' in baseEntry.measurements) || !('picks' in baseEntry.measurements)) {
            return undefined
          }

          // calculate z-score, testing with star power wins against without star power wins
          const zN = comparingEntry.measurements.picks
          const zX = comparingEntry.measurements.winRate * zN
          const zP = baseEntry.measurements.winRate
          const zCondition = zN >= 50 && zN * zP > 5 && zN * (1 - zP) > 5
          if (!zCondition) {
            return undefined
          }

          const measurements: Record<string, number> = {}
          const measurementsFormatted: Record<string, string> = {}
          measurements.winsZScore = (zX - zN * zP) / Math.sqrt(zN * zP * (1 - zP))
          for (const m in baseEntry.measurements) {
            measurements[m] = baseEntry.measurements[m] - comparingEntry.measurements[m]
            measurementsFormatted[m] = metaStatMaps.formatters[m](measurements[m])
          }

          return {
            ...comparingEntry,
            measurements,
            measurementsFormatted,
          }
        })
      .filter(e => e != undefined) as MetaGridEntry[]
    }
  })
}
