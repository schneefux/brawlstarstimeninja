<template>
  <brawlers-row
    :brawlers="data"
    :loading="$fetchState.pending"
    class="mx-auto h-14 w-72"
  >
    <template v-slot="{ brawler }">
      {{ commonMeasurements.winRate.formatter(brawler.battle_victory) }}
      {{ commonMeasurements.winRate.nameShort }}
    </template>
  </brawlers-row>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { commonMeasurements } from '~/lib/cube'
import { brawlerId } from '~/lib/util'

interface Row {
  brawler_name: string
  battle_victory: number
}

export default Vue.extend({
  props: {
    map: {
      type: String,
    },
    mode: {
      type: String,
    },
    season: {
      type: String,
    },
    limit: {
      type: Number,
      default: 5
    },
  },
  data() {
    return {
      data: [] as Row[],
    }
  },
  watch: {
    map: '$fetch',
    mode: '$fetch',
    season: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    this.data = []

    const data = await this.$clicker.query('meta.map.best', 'map',
      ['brawler_name'],
      ['battle_victory'],
      {
        ...this.$clicker.defaultSlicesRaw('map'),
        ...(this.map != undefined ? {
          battle_event_map: [this.map],
        } : {}),
        ...(this.mode != undefined ? {
          battle_event_mode: [this.mode],
        } : {}),
        ...(this.season != undefined ? {
          trophy_season_end: undefined,
          trophy_season_end_exact: [this.season],
        } : {}),
      },
      {
        sort: { battle_victory_adj: 'desc' },
        limit: this.limit,
        cache: 60*10,
      })
    this.data = data.data as any
  },
  computed: {
    brawlerId() {
      return brawlerId
    },
    commonMeasurements() {
      return commonMeasurements
    },
  },
})
</script>
