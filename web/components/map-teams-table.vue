<template>
  <card
    v-bind="$attrs"
    :title="title"
  >
    <div
      slot="content"
      class="overflow-x-auto"
    >
      <p class="text-base md:text-lg">Best Teams for {{ description }}.</p>
      <b-table
        :columns="columns"
        :rows="entries"
        :page-size="pageSize"
        id-key="brawlerNames"
        class="font-semibold text-sm md:text-lg"
      >
        <template v-slot:[`dimensions.brawlers`]="{ row }">
          <meta-brawlers-renderer :row="row"></meta-brawlers-renderer>
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
import metaBrawlersRenderer from './meta-brawlers-renderer.vue'

export default Vue.extend({
  components: { metaBrawlersRenderer },
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
    const query = this.$clicker.constructQuery(['brawlers'], ['picks', 'winRate'], {
      map: [this.map],
      mode: [this.mode],
      season: ['current'],
    })
    const slices = {
      ...this.$clicker.defaultSlices('team'),
      ...query.slices,
    }
    this.slices = this.$clicker.routeToSlices(this.$route, slices)

    const data = await this.$clicker.query('meta.map.teams', 'team',
      query.dimensions,
      ['picks', 'battle_victory'],
      this.slices, {
        sort: { picks: 'desc' },
        cache: 60*30,
      })
    this.entries = this.$clicker.mapToMetaGridEntry(['brawlers'], ['picks', 'winRate'], data.data, data.totals)
  },
  computed: {
    title(): string {
      if (this.mode == undefined) {
        return 'Best Teams in Brawl Stars'
      }
      if (this.map == undefined) {
        return `Best Teams for ${formatMode(this.mode)}`
      }
      return `Best Teams for ${formatMode(this.mode)} - ${this.map}`
    },
    description(): string {
      return this.$clicker.describeSlices(this.slices)
    },
    dashboardLink(): RawLocation {
      return {
        path: '/dashboard',
        query: {
          cube: 'team',
          ...(this.mode != undefined ? {
            mode: this.mode,
          } : {}),
          ...(this.map != undefined ? {
            map: this.map,
          } : {}),
        },
      }
    },
    columns(): Column[] {
      return [{
        title: 'Team',
        key: 'dimensions.brawlers',
      }, {
        title: metaStatMaps.labels.winRate,
        key: 'measurementsFormatted.winRate',
      }, {
        title: metaStatMaps.labels.picks,
        key: 'measurementsFormatted.picks',
      }]
    },
  },
})
</script>

<style lang="postcss" scoped>
.leading-tight\! {
  @apply leading-tight !important;
}
</style>
