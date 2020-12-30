<template>
  <c-query
    v-bind="$attrs"
    :config="config"
    :dimensions-ids="['player']"
    :measurements-ids="isShowdown ? ['picks', 'rank', 'brawler'] : ['wins', 'winRate', 'brawler']"
    :slices="{ mode: [mode], map: [map] }"
    :sort-id="isShowdown ? 'picks' : 'wins'"
    :limit="50"
    cube-id="battle"
  >
    <template v-slot="data">
      <v-table
        :title="title"
        v-bind="data"
      >
        <template v-slot:[`dimensions.player`]="data">
          <d-player v-bind="data"></d-player>
        </template>
        <template v-slot:[`measurements.brawler`]="data">
          <d-brawler v-bind="data"></d-brawler>
        </template>
      </v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import Vue from 'vue'
import { formatMode } from '~/lib/util'
import VTable from '@/components/clicker/visualisations/v-table.vue'
import DPlayer from '@/components/clicker/renderers/d-player.vue'
import DBrawler from '@/components/clicker/renderers/d-brawler.vue'
import CQuery from '@/components/clicker/c-query.vue'
import config from '@/lib/cube'

export default Vue.extend({
  components: {
    VTable,
    DPlayer,
    DBrawler,
    CQuery,
  },
  inheritAttrs: false,
  props: {
    mode: {
      type: String,
    },
    map: {
      type: String,
    },
  },
  computed: {
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
    config() {
      return config
    },
  },
})
</script>
