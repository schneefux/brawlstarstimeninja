<template>
  <card
    v-bind="$attrs"
    :title="title"
  >
    <div
      slot="content"
      class="overflow-x-auto flex flex-col h-full"
    >
      <p class="text-base md:text-lg">Brawl Stars Tier List for {{ description }}.</p>
      <b-table
        :columns="columns"
        :rows="rows"
        :page-size="pageSize"
        id-key="name"
        class="font-semibold text-sm md:text-lg h-full"
        ranked
      >
        <template v-slot:[`dimensions.brawler`]="{ row }">
          <meta-brawler-renderer :row="row"></meta-brawler-renderer>
        </template>
      </b-table>
    </div>

    <b-button
      slot="actions"
      :to="dashboardLink"
      secondary
      sm
    >
      Explore in Dashboard
    </b-button>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { RawLocation } from 'vue-router'
import { metaStatMaps, MetaGridEntry, brawlerId, compare1, capitalizeWords, MetaGridEntryTiered, scaleEntriesIntoTiers, formatMode } from '../lib/util'
import { Column } from './b-table.vue'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    mode: {
      type: String
    },
    map: {
      type: String
    },
    pageSize: {
      type: Number,
      default: 10
    },
  },
  data() {
    return {
      slices: {} as Record<string, string[]>,
      entries: [] as MetaGridEntry[],
    }
  },
  watch: {
    mode: '$fetch',
    map: '$fetch',
    pageSize: '$fetch',
  },
  fetchDelay: 0,
  fetchOnServer: false, // FIXME: causes render error
  async fetch() {
    const query = this.$clicker.constructQuery(['brawler'], ['winRateAdj', 'starRate', 'useRate'], {
      mode: [this.mode],
      map: [this.map],
    })
    const slices = {
      ...this.$clicker.defaultSlices('map'),
      ...query.slices,
    }
    this.slices = this.$clicker.routeToSlices(this.$route, slices)

    const data = await this.$clicker.query('meta.map', 'map',
      query.dimensions,
      query.measurements,
      this.slices, {
        sort: { picks: 'desc' },
        cache: 60*30,
      })

    this.entries = this.$clicker.mapToMetaGridEntry(['brawler'], ['winRateAdj', 'useRate', 'starRate'], data.data, data.totals)
  },
  computed: {
    title(): string {
      if (this.mode == undefined) {
        return 'Best Brawlers in Brawl Stars'
      }
      if (this.map == undefined) {
        return `Best Brawlers for ${formatMode(this.mode)}`
      }
      return `Best Brawlers for ${formatMode(this.mode)} - ${this.map}`
    },
    description(): string {
      return this.$clicker.describeSlices(this.slices)
    },
    columns(): Column[] {
      return [{
        title: 'Tier',
        key: 'tier',
      }, {
        title: 'Name',
        key: 'dimensions.brawler',
      }, {
        title: metaStatMaps.labels.winRateAdj,
        key: 'measurementsFormatted.winRateAdj',
      }, {
        title: metaStatMaps.labels.useRate,
        key: 'measurementsFormatted.useRate',
      }]
    },
    rows(): unknown[] {
      return scaleEntriesIntoTiers(this.entries, 'winRateAdj')
    },
    dashboardLink(): RawLocation {
      return {
        path: '/dashboard',
        query: {
          cube: 'map',
          ...(this.mode != undefined ? {
            mode: this.mode,
          } : {}),
          ...(this.map != undefined ? {
            map: this.map,
          } : {}),
        },
      }
    },
  },
})
</script>
