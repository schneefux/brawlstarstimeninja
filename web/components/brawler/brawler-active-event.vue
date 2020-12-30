<template>
  <event-card
    :mode="mode"
    :map="map"
    :id="id"
    :loading="$fetchState.pending"
    size="w-80"
  >
    <p v-if="end != undefined" slot="infobar" class="text-right">
      ends in {{ timeTillEnd }}
    </p>

    <div
      slot="content"
      class="flex justify-center"
    >
      <div class="flex items-end bg-gray-800 rounded">
        <media-img
          :path="`/brawlers/${brawlerId}/avatar`"
          :alt="brawlerName"
          size="128"
          clazz="w-16 mr-2"
        ></media-img>
        <kv-table
          v-if="data.picks > 0"
          class="w-48 px-3 py-2"
          :data="table"
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
      :to="`/tier-list/mode/${camelToKebab(mode)}/map/${slugify(map)}`"
      primary
      prefetch
      sm
    >
      Open
    </b-button>
  </event-card>
</template>

<script lang="ts">
import { formatDistanceToNow, parseISO } from 'date-fns'
import Vue from 'vue'
import { mapState } from 'vuex'
import { commonMeasurements } from '~/lib/cube'
import { brawlerId, camelToKebab, slugify } from '@/lib/util'

interface Row {
  wins: number
  picks: number
  picks_weighted: number
  battle_victory: number
}

interface TotalsRow {
  picks_weighted: number
}

export default Vue.extend({
  props: {
    mode: {
      // camel case
      type: String,
      required: true
    },
    map: {
      type: String,
      required: true
    },
    id: {
      type: [String, Number],
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
    end: {
      type: String,
    },
  },
  data() {
    return {
      data: {} as Row,
      totals: {} as TotalsRow,
    }
  },
  watch: {
    mode: '$fetch',
    map: '$fetch',
    brawlerName: '$fetch',
  },
  fetchDelay: 0,
  fetchOnServer: false,
  async fetch() {
    const data = await this.$clicker.query('meta.map.brawler-event', 'map',
      [],
      ['battle_victory', 'picks', 'picks_weighted', 'wins'],
      {
        ...this.$clicker.defaultSlicesRaw('map'),
        battle_event_map: [this.map],
        battle_event_mode: [this.mode],
        brawler_name: [this.brawlerName.toUpperCase()],
      },
      { cache: 60*10 })

    const totals = await this.$clicker.query('meta.map.brawler-event', 'map',
      [],
      ['picks_weighted'],
      {
        ...this.$clicker.defaultSlicesRaw('map'),
        battle_event_map: [this.map],
        battle_event_mode: [this.mode],
      },
      { cache: 60*10 })

    this.data = data.data[0]
    this.totals = totals.data[0]
  },
  computed: {
    useRate(): number {
      return this.data.picks_weighted / this.totals.picks_weighted
    },
    timeTillEnd(): string {
      if (this.end == undefined) {
        return ''
      }
      return formatDistanceToNow(parseISO(this.end))
    },
    table(): string[][] {
      return [
        [ commonMeasurements.picks.name, commonMeasurements.picks.formatter(this.data.picks) ],
        [ commonMeasurements.useRate.name, commonMeasurements.useRate.formatter(this.useRate) ],
        [ commonMeasurements.winRate.name, commonMeasurements.winRate.formatter(this.data.battle_victory) ],
      ]
    },
    brawlerId(): string {
      return brawlerId({ name: this.brawlerName })
    },
    camelToKebab() {
      return camelToKebab
    },
    slugify() {
      return slugify
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers,
    })
  },
})
</script>
