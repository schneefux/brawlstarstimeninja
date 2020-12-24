<template>
  <div class="flex flex-wrap justify-center">
    <meta-slicers
      :value="slices"
      :measurement="measurement"
      :measurements="measurements"
      :cube="cube"
      :cubes="['map', 'starpower', 'gadget', 'synergy', 'team']"
      :loading="loading"
      class="w-full sticky z-10 top-12 lg:top-0!"
      @input="s => setSlices(s)"
      @measurement="m => setMeasurement(m)"
      @cube="c => setCube(c)"
    ></meta-slicers>

    <div class="w-full flex flex-wrap">
      <meta-sample-info
        :cube="cube"
        :data="sortedEntries"
        :sample="sample"
        :users="users"
        :timestamp="timestamp"
        :measurement="measurement"
        class="w-full max-w-lg"
      ></meta-sample-info>

      <meta-graph
        :cube="cube"
        :dimension="dimension"
        :entries="sortedEntries"
        :measurement="measurement"
        title="Graph View"
        class="flex-1 h-64 md:h-full"
        full-height
      ></meta-graph>
    </div>

    <div class="w-full flex flex-wrap justify-center">
      <meta-table
        v-if="['map', 'starpower', 'gadget', 'synergy', 'team', 'battle'].includes(cube)"
        title="Table View"
        :entries="sortedEntries"
        :dimension="dimension"
        :measurement="measurement"
        sm
        full-height
      ></meta-table>

      <div class="flex-1 flex flex-col">
        <card
          v-if="views.length > 1"
          class="-mb-3"
        >
          <div
            slot="content"
            class="w-full flex flex-wrap"
          >
            <span class="text-gray-200 mr-3 font-normal self-center">View</span>
            <b-button
              v-for="v in views"
              :key="v.key"
              :selected="view == v.key"
              class="mr-2 mb-1"
              sm
              dark
              @click="setView(v.key)"
            >
              {{ v.title }}
            </b-button>
          </div>
        </card>

<!--
        <meta-tier-list
          v-if="view == 'tierlist'"
          :entries="sortedEntries"
          :stat="measurement"
          :description="description"
          full-height
          class="h-full"
        ></meta-tier-list>

        <meta-grid
          v-if="view == 'legacy'"
          :measurements="measurements"
          :entries="sortedEntries"
          :stat="measurement"
          full-height
          class="h-full"
        ></meta-grid>
        -->
      </div>

      <div class="w-full flex">
        <b-button
          class="ml-auto"
          sm
          secondary
          @click="downloadCsv()"
        >
          Download Data
        </b-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { formatDistanceToNow, parseISO } from 'date-fns'
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import { capitalizeWords, compare1, MetaGridEntry } from '~/lib/util'

function defaultMeasurement(cube: string) {
  if (['map', 'synergy'].includes(cube)) {
    return 'winRateAdj'
  }
  if (['starpower', 'gadget'].includes(cube)) {
    return 'winsZScore'
  }
  if (['team'].includes(cube)) {
    return 'wins'
  }
  if (['battle'].includes(cube)) {
    return 'users'
  }
  return 'winRate'
}

function defaultView(cube: string) {
  if (['map', 'starpower', 'gadget', 'synergy'].includes(cube)) {
    return 'tierlist'
  }
  if (['team'].includes(cube)) {
    return 'legacy'
  }
  return undefined
}

function measurementsForCube(cube: string, slices: Record<string, string[]> = {}) {
  if (['map', 'synergy'].includes(cube)) {
    const mode = (slices.battle_event_mode || [])[0]
    if (mode == undefined) {
      return ['winRateAdj', 'winRate', 'wins', 'useRate', 'pickRate', 'starRate', 'rank1Rate', 'duration']
    }

    let measurements = ['winRateAdj', 'winRate', 'wins', 'useRate', 'pickRate']
    // all 3v3: star player
    if (['gemGrab', 'heist', 'bounty', 'hotZone', 'brawlBall', 'siege'].includes(mode)) {
      measurements = [...measurements, 'starRate']
    }
    // all 3v3 except bounty: duration
    if (['gemGrab', 'heist', 'hotZone', 'brawlBall', 'siege'].includes(mode)) {
      measurements = [...measurements, 'duration']
    }
    if (mode.endsWith('howdown')) {
      measurements = [...measurements, 'rank1Rate']
    }
    return measurements
  }
  if (['starpower', 'gadget'].includes(cube)) {
    return ['winsZScore', 'winRateDiff', 'starRateDiff', 'rank1RateDiff']
  }
  if (['team'].includes(cube)) {
    return ['wins', 'winRate']
  }
  if (['battle'].includes(cube)) {
    return ['users', 'winRate', 'wins', 'picks', 'starRate', 'rank1Rate', 'duration']
  }
  return []
}

export default Vue.extend({
  props: {
    defaultCube: {
      type: String,
      required: true
    },
    defaultSlices: {
      type: Object as PropType<Record<string, string[]>>,
      default: () => ({})
    },
    defaultMeasurement: {
      type: String
    },
  },
  data() {
    return {
      cube: this.defaultCube,
      slices: {
        ...this.$clicker.defaultSlices(this.defaultCube),
        ...this.defaultSlices,
      },
      measurement: this.defaultMeasurement || defaultMeasurement(this.defaultCube),
      entries: [] as MetaGridEntry[],
      view: defaultView(this.defaultCube),
      sample: 0,
      users: undefined,
      timestamp: '1970-01-01' as string|undefined,
      loading: false,
    }
  },
  fetchDelay: 0,
  async fetch() {
    await this.update({})
  },
  methods: {
    async setSlices(s: Record<string, string[]>) {
      await this.update({ slices: s })
    },
    async setMeasurement(m: string) {
      await this.update({ measurement: m })
    },
    async setCube(c: string) {
      // reset all selectors
      await this.update({
        cube: c,
        slices: this.$clicker.defaultSlices(c),
        measurement: defaultMeasurement(c),
        view: defaultView(c),
      })
    },
    async setView(v: string) {
      await this.update({ view: v })
    },
    downloadCsv() {
      this.$gtag.event('click', {
        'event_category': this.cube + '_meta',
        'event_label': 'download_csv',
      })

      // TODO fetch first!
      const csv = 'title,brawler,sampleSize,' + this.measurements.join(',') + '\n'
        + this.entries.map(entry => entry.title + ',' + entry.brawlers.join('+') + ',' + entry.sampleSize + ',' + this.measurements.map(stat => entry.stats[stat]).join(',')).join('\n')
      const downloader = document.createElement('a')
      downloader.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
      downloader.target = '_blank'
      downloader.download = 'export.csv'
      downloader.click()
    },
    async update(args: { measurement?: string, view?: string, slices?: Record<string, string[]>, cube?: string }) {
      this.loading = true

      const measurement = args.measurement || this.measurement
      const view = args.view || this.view
      const slices = args.slices || this.slices
      const cube = args.cube || this.cube

      const measurements = (view == 'legacy' ? measurementsForCube(cube) : [measurement, 'picks'])

      // TODO put dimensions into the URL, allowing to group by maps instead of brawlers etc.
      const dimensions = cube == 'map' ? ['brawler'] :
        cube == 'synergy' ? ['brawler', 'ally'] :
        cube == 'team' ? ['brawlers'] :
        cube == 'battle' ? ['player'] : []

      if (dimensions.length > 0) {
        const query = this.$clicker.constructQuery(dimensions, measurements, slices)
        const data = await this.$clicker.query('meta.' + cube, cube,
          query.dimensions,
          [
            ...query.measurements,
            'timestamp',
            ...(cube == 'battle' ? ['player', 'users'] : [])
          ],
          slices,
          {
            sort: { picks: 'desc' },
            cache: 60*30,
            limit: 500,
          })

        this.entries = this.$clicker.mapToMetaGridEntry(dimensions, measurements, data.data, data.totals)

        this.sample = data.totals.picks
        this.users = data.totals.users
        this.timestamp = data.totals.timestamp
      }

      if (['starpower', 'gadget'].includes(cube)) {
        const calculateZScore = measurements.includes('winsZScore')
        const fetchingMeasurements = measurements
          .map(m => m == 'winsZScore' ? 'winRate' : m)
        const accessoryRows = cube == 'starpower' ? ['brawler_starpower_id', 'brawler_starpower_name'] : ['brawler_gadget_id', 'brawler_gadget_name']

        const data = await this.$clicker.query('meta.' + cube, cube,
          ['brawler_id', 'brawler_name', ...accessoryRows],
          [...fetchingMeasurements, 'picks', 'timestamp'],
          slices,
          { sort: { picks: 'desc' }, cache: 60*60 })
        this.entries = calculateDiffs(data.data, cube + 's', accessoryRows[1] as any, accessoryRows[0] as any, calculateZScore)

        this.sample = data.totals.picks
        this.timestamp = data.totals.timestamp
      }

      this.measurement = measurement
      this.view = view
      this.slices = slices
      this.cube = cube

      this.loading = false
    }
  },
  computed: {
    dimension() {
      if (['map', 'starpower', 'gadget', 'synergy'].includes(this.cube)) {
        return 'brawler.name'
      }
      return ''
    },
    views() {
      if (['map', 'starpower', 'gadget', 'synergy'].includes(this.cube)) {
        return [{
          key: 'tierlist',
          title: 'Tier List',
        }, {
          key: 'legacy',
          title: 'Details',
        }]
      }
      if (['team'].includes(this.cube)) {
        return [{
          key: 'legacy',
          title: 'Details',
        }]
      }
      return []
    },
    sortedEntries(): MetaGridEntry[] {
      return this.entries
        .slice()
        .filter(e => e.measurements[this.measurement] != undefined)
        .sort(compare1(this.measurement as any))
    },
    description(): string {
      return this.$clicker.describeSlices(this.slices, this.timestamp)
    },
    measurements(): string[] {
      return measurementsForCube(this.cube, this.slices)
    },
  },
})
</script>

<style lang="postcss" scoped>
.top-12 {
  top: 3rem;
}

@responsive {
  .top-0\! {
    @apply top-0 !important;
  }
}
</style>
