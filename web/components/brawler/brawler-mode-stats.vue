<template>
  <event-card
    :mode="mode"
    :loading="$fetchState.pending"
    size="w-80"
  >
    <div
      slot="content"
      class="flex justify-center"
    >
      <div class="flex items-end bg-gray-800 rounded">
        <media-img
          :path="`/brawlers/${brawlerId}/avatar`"
          size="128"
          clazz="w-16 mr-2"
        ></media-img>
        <kv-table
          v-if="modeData.picks > 0"
          :data="modeTable"
          class="w-48 px-3 py-2"
        ></kv-table>
        <div
          v-else
          class="w-48 flex"
          style="height: 112px;"
        >
          <p class="m-auto">No data available.</p>
        </div>
      </div>
    </div>

    <b-button
      slot="actions"
      :to="`/tier-list/mode/${camelToKebab(mode)}`"
      primary
      prefetch
      sm
    >
      Open
    </b-button>
  </event-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import { commonMeasurements } from '~/lib/cube';
import { camelToKebab } from '@/lib/util';
import { ModeMetaMap, MapMetaMap, MapMeta, ModeMeta } from '@/model/MetaEntry';

interface ModeRow {
  battle_victory: number
  picks: number
  picks_weighted: number
}

interface ModeTotal {
  picks_weighted: number
}

interface MapRow {
  battle_event_map: string
  battle_victory: number
  picks_weighted: number
}

export default Vue.extend({
  props: {
    brawlerId: {
      type: String,
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
    mode: {
      // camel case
      type: String,
      required: true
    },
  },
  data() {
    return {
      modeData: {} as ModeRow,
      modeTotals: {} as ModeTotal,
      mapData: [] as MapRow[],
      mapTotals: [] as MapRow[],
    }
  },
  watch: {
    brawlerId: '$fetch',
    brawlerName: '$fetch',
    mode: '$fetch',
  },
  fetchDelay: 0,
  fetchOnServer: false,
  async fetch() {
    // TODO use brawler ID

    const modeData = await this.$clicker.query<ModeRow>('meta.mode.brawler-mode-stats-widget', 'map',
      [],
      ['battle_victory', 'picks_weighted', 'picks'],
      {
        ...this.$clicker.defaultSlicesRaw('map'),
        brawler_name: [this.brawlerName.toUpperCase()],
        battle_event_mode: [this.mode],
      },
      { cache: 60*60 })

    const modeTotals = await this.$clicker.query<ModeRow>('meta.mode.brawler-mode-stats-widget', 'map',
      ['battle_event_mode'],
      ['picks_weighted'],
      {
        ...this.$clicker.defaultSlicesRaw('map'),
        battle_event_mode: [this.mode],
      },
      { cache: 60*60 })

    const mapData = await this.$clicker.query<MapRow>('meta.map.brawler-mode-stats-widget', 'map',
      ['battle_event_map'],
      ['battle_victory', 'picks_weighted'],
      {
        ...this.$clicker.defaultSlicesRaw('map'),
        brawler_name: [this.brawlerName.toUpperCase()],
        battle_event_mode: [this.mode],
      },
      { cache: 60*60 })

    const mapTotals = await this.$clicker.query<MapRow>('meta.map.brawler-mode-stats-widget', 'map',
      ['battle_event_map'],
      ['battle_victory', 'picks_weighted'],
      {
        ...this.$clicker.defaultSlicesRaw('map'),
        battle_event_mode: [this.mode],
      },
      { cache: 60*60 })

    if (modeData.data.length > 0) {
      this.modeData = modeData.data[0]
    }
    if (modeTotals.data.length > 0) {
      this.modeTotals = modeTotals.data[0]
    }
    this.mapData = mapData.data
    this.mapTotals = mapTotals.data
  },
  computed: {
    aboveAverageMaps(): number {
      const compareMaps = (m: MapRow, t: MapRow|undefined) => t == undefined ? false : m.battle_victory * m.picks_weighted > t.battle_victory * t.picks_weighted / this.totalBrawlers
      const findTotal = (m: MapRow) => this.mapTotals.find(m2 => m2.battle_event_map == m.battle_event_map)
      return this.mapData.filter(m => compareMaps(m, findTotal(m))).length
    },
    camelToKebab() {
      return camelToKebab
    },
    modeTable(): string[][] {
      return [
        [ commonMeasurements.picks.name, commonMeasurements.picks.formatter(this.modeData.picks) ],
        [ commonMeasurements.useRate.name, commonMeasurements.useRate.formatter(this.modeData.picks_weighted / this.modeTotals.picks_weighted) ],
        [ commonMeasurements.winRate.name, commonMeasurements.winRate.formatter(this.modeData.battle_victory) ],
        [ 'Viable Maps', this.aboveAverageMaps + '/' + this.mapData.length ],
      ]
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers as number,
    })
  },
});
</script>
