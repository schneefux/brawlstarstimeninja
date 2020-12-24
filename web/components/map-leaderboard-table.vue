<template>
  <card
    v-bind="$attrs"
    :title="title"
  >
    <template v-slot:content>
      <p class="w-64">
        {{ isShowdown ? 'Most successful players' : 'Players with most wins'}}
        in Brawl Stars this season.
      </p>
      <b-table
        slot="content"
        :columns="columns"
        :rows="entries"
        id-key="player"
        ranked
      >
        <template v-slot:[`dimensions.player`]="{ row }">
          <router-link :to="`/player/${row.dimensions.player.tag}`">
            {{ row.dimensions.player.name }}
          </router-link>
        </template>
        <template v-slot:[`dimensions.brawler`]="{ row }">
          <router-link :to="`/tier-list/brawler/${row.dimensions.brawler.id}`">
            <media-img
              :path="`/brawlers/${row.dimensions.brawler.id}/avatar`"
              :alt="row.dimensions.brawler.name"
              clazz="h-6"
            ></media-img>
          </router-link>
        </template>
      </b-table>
    </template>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { brawlerId, capitalizeWords, formatMode, MetaGridEntry, metaStatMaps } from '~/lib/util'
import { Column } from './b-table.vue'
import { PlayerRankTableRow } from './player-rank-table.vue'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    mode: {
      type: String,
    },
    map: {
      type: String,
    },
  },
  data() {
    return {
      entries: [] as MetaGridEntry[],
    }
  },
  watch: {
    mode: '$fetch',
    map: '$fetch',
  },
  fetchDelay: 0,
  fetchOnServer: false, // FIXME: causes render error
  async fetch() {
    const measurements = ['player', 'brawler' , ...(this.isShowdown? ['picks', 'rank'] : ['wins', 'winRate'])]
    const query = this.$clicker.constructQuery(['player'], measurements, {
      map: [this.map],
      mode: [this.mode],
      season: ['current'],
    })
    const data = await this.$clicker.query('mode.leaderboard',
      'battle',
      query.dimensions,
      query.measurements, {
        ...this.$clicker.defaultSlices('battle'),
        ...query.slices,
      }, {
        cache: 60*60,
        sort: { wins: 'desc' },
        limit: 5,
      })

    this.entries = this.$clicker.mapToMetaGridEntry(['player'], measurements, data.data, data.totals)
  },
  computed: {
    columns(): Column[] {
      return this.isShowdown ? [{
        title: 'Player',
        key: 'dimensions.player',
      }, {
        title: 'Brawler',
        key: 'dimensions.brawler',
      }, {
        title: metaStatMaps.labels.picks,
        key: 'measurementsFormatted.picks',
      }, {
        title: metaStatMaps.labels.rank,
        key: 'measurementsFormatted.rank',
      }] : [{
        title: 'Player',
        key: 'dimensions.player',
      }, {
        title: 'Brawler',
        key: 'dimensions.brawler',
      }, {
        title: metaStatMaps.labels.wins,
        key: 'measurementsFormatted.wins',
      }, {
        title: metaStatMaps.labels.winRate,
        key: 'measurementsFormatted.winRate',
      }]
    },
    title(): string {
      if (this.mode == undefined) {
        return 'Best Players in Brawl Stars'
      }
      if (this.map == undefined) {
        return `Best Players in ${formatMode(this.mode)}`
      }
      return `Best Players in ${formatMode(this.mode)} - ${this.map}`
    },
    isShowdown(): boolean {
      return this.mode != undefined && this.mode.toLowerCase().includes('showdown')
    },
  },
})
</script>
