import { differenceInMinutes, parseISO } from "date-fns"
import { formatMode, MetaGridEntry } from "~/lib/util"
import { CurrentAndUpcomingEvents } from "~/model/Api"
import { Route, Location } from "vue-router"
import { commonMeasurements, Dimension, Measurement, Slice, SliceValue } from "~/lib/cube"

export interface PicksWins {
  picks: number
  wins: number
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
  defaultSlices(cubeId: string): SliceValue
  defaultSlicesRaw(cubeId: string): Record<string, string[]>
  query<T=any>(
    name: string,
    cube: string,
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
  routeToSlices(route: Route, defaults?: SliceValue): SliceValue
  slicesToLocation(slices: SliceValue, defaults?: SliceValue): Location
  constructQuery(dimensions: Dimension[], measurements: Measurement[], slices: Slice[], slicesValues: SliceValue, metaColumns: string[]): { dimensions: string[], measurements: string[], slices: Record<string, string[]> }
  mapToMetaGridEntry(dimensions: Dimension[], measurements: Measurement[], rows: any[], totals: any, metaColumns: string[]): MetaGridEntry[]
  compareEntries(baseEntries: MetaGridEntry[], comparingEntries: MetaGridEntry[], joiner: (b: MetaGridEntry, c: MetaGridEntry) => boolean): MetaGridEntry[]
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
            season: ['balance'],
            powerplay: ['false'],
          }
        case 'battle':
          return {
            season: ['month'],
          }
        case 'brawler':
          return {
          }
        case 'synergy':
          return {
            season: ['balance'],
            ally: ['SHELLY'],
          }
        default:
          return {
            season: ['balance'],
          }
      }
    },
    defaultSlicesRaw(cube) {
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
          mode: [route.query['mode'] as string],
        }: {}),
        ...('map' in route.query ? {
          map: [route.query['map'] as string],
        }: {}),
        ...('powerplay' in route.query ? {
          powerplay: [route.query['powerplay'] as string],
        } : {}),
        ...('season' in route.query ? {
          season: [route.query['season'] as string],
        } : {}),
        ...('range' in route.query ? {
          trophies: route.query['range'] as string[],
        } : {}),
        ...('ally' in route.query ? {
          ally: [route.query['ally'] as string],
        } : {}),
        ...('name_like' in route.query ? {
          playerName: [route.query['name_like'] as string],
        } : {}),
      }
    },
    slicesToLocation(slices, defaults={}) {
      const diff = Object.fromEntries(
        Object.entries(slices)
          .filter(([name, params]) => !(name in defaults) || JSON.stringify(defaults[name]) != JSON.stringify(params)
      ))

      const query = {} as Record<string, string[]>
      if ('mode' in diff) {
        query['mode'] = diff.battle_event_mode!
      }
      if ('map' in diff) {
        query['map'] = diff.battle_event_map!
      }
      if ('powerplay' in diff) {
        query['powerplay'] = diff.battle_event_powerplay!
      }
      if ('season' in diff) {
        query['season'] = diff.trophy_season_end!
      }
      if ('trophies' in diff) {
        query['range'] = diff.brawler_trophyrange!
      }
      if ('ally' in diff) {
        query['ally'] = diff.ally_brawler_name!
      }
      if ('playerName' in diff) {
        query['name_like'] = diff.player_name_ilike!
      }

      return { query }
    },
    constructQuery(dimensions, measurements, slices, slicesValues, metaColumns) {
      // TODO filter duplicates
      const queryDimensions = dimensions.map(d => d.column)
      const queryMeasurements = <string[]>[]

      metaColumns.forEach(c => queryMeasurements.push(c))
      measurements.forEach(m => {
        queryMeasurements.push(m.column)
        if ('anyColumns' in m) {
          // m is actually a dimension
          (<Dimension>m).anyColumns
            .forEach(c => queryMeasurements.push(c))
        }
      })

      dimensions.forEach(d => d.anyColumns
        .forEach(c => queryMeasurements.push(c)))

      const querySlices = Object.fromEntries(Object.entries(slicesValues)
        .filter(([key, value]) => {
          if (!Array.isArray(value)) {
            throw new Error('Illegal slice specification! ' + key + ': ' + value)
          }
          return value.length > 0 && value[0] != undefined
        })
        .map(([key, value]) => {
          const slice = slices.find(s => s.id == key)
          if (slice == undefined) {
            throw new Error('Undefined slice ' + key)
          }
          return [slice.column, value]
        })
      )

      return {
        dimensions: queryDimensions,
        measurements: queryMeasurements,
        slices: querySlices,
      }
    },
    mapToMetaGridEntry(dimensions, measurements, rows, totals, metaColumns) {
      return rows.map(row => {
        const entry: MetaGridEntry = {
          id: '',
          dimensionsRaw: {},
          dimensions: {},
          measurementsRaw: {},
          measurements: {},
          meta: {},
        }

        for (const m of metaColumns) {
          entry.meta[m] = row[m]
        }

        const anyDimensions: Dimension[] = []
        for (const m of measurements) {
          if ('percentage' in m) {
            // m is a measurement
            const measurement =  row[m.column] / (m.percentage ? totals[m.column] : 1)
            entry.measurementsRaw[m.id] = measurement
            entry.measurements[m.id] = m.formatter(measurement)
          } else {
            // m is a dimension
            anyDimensions.push(m)
          }
        }

        let id = ''
        for (const d of dimensions.concat(anyDimensions)) {
          const dimension = d.anyColumns
            .concat(d.column)
            .reduce((o, c) => ({ ...o, [c]: row[c] }), {}) // pick keys from row
          entry.dimensionsRaw[d.id] = dimension
          const formatted = d.formatter(dimension)
          entry.dimensions[d.id] = formatted
          id += formatted
        }
        entry.id = id

        return entry
      })
    },
    compareEntries(baseEntries: MetaGridEntry[], comparingEntries: MetaGridEntry[], joiner) {
      return comparingEntries
        .map(comparingEntry => {
          const baseEntry = baseEntries.find(b => joiner(comparingEntry, b))
          if (baseEntry == undefined) {
            return undefined
          }
          // replace '...Diff' by actual diffs
          const measurementsRaw: Record<string, number> = {}
          const measurements: Record<string, string> = {}

          for (const m in baseEntry.measurements) {
            measurementsRaw[m] = baseEntry.measurementsRaw[m] - comparingEntry.measurementsRaw[m]
            measurements[m] = commonMeasurements[m].formatter(measurementsRaw[m])
          }

          if (comparingEntry.measurements.winsZScore != undefined) {
            // replace '...ZScore' by actual z-score (based on wins)
            const zN = comparingEntry.measurementsRaw.picks
            const zX = comparingEntry.measurementsRaw.winsZScore
            const zP = baseEntry.measurementsRaw.winsZScore / baseEntry.measurementsRaw.picks
            const zCondition = zN >= 50 && zN * zP > 5 && zN * (1 - zP) > 5
            if (zCondition) {
              measurementsRaw.winsZScore = (zX - zN * zP) / Math.sqrt(zN * zP * (1 - zP))
            } else {
              measurementsRaw.winsZScore = 0
            }
            measurements.winsZScore = commonMeasurements.winsZScore.formatter(measurementsRaw.winsZScore)
          }

          return {
            ...comparingEntry,
            measurementsRaw,
            measurements,
          }
        })
      .filter(e => e != undefined) as MetaGridEntry[]
    }
  })
}
