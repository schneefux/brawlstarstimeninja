<template>
  <c-query
    v-bind="$attrs"
    :config="config"
    :dimensions-ids="['brawler']"
    :measurements-ids="['winRateAdj', 'useRate']"
    :slices="{ mode: [mode], map: [map] }"
    sort-id="winRateAdj"
    cube-id="map"
  >
    <template v-slot="data">
      <v-table
        :title="title"
        :link="dashboardLink"
        v-bind="data"
      >
        <template v-slot:[`dimensions.brawler`]="data">
          <d-brawler v-bind="data"></d-brawler>
        </template>
      </v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import Vue from 'vue'
import { RawLocation } from 'vue-router'
import { formatMode } from '@/lib/util'
import VTable from '@/components/clicker/visualisations/v-table.vue'
import DBrawler from '@/components/clicker/renderers/d-brawler.vue'
import CQuery from '@/components/clicker/c-query.vue'
import config from '@/lib/cube'

export default Vue.extend({
  components: {
    VTable,
    DBrawler,
    CQuery,
  },
  inheritAttrs: false,
  props: {
    mode: {
      type: String
    },
    map: {
      type: String
    },
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
    config() {
      return config
    },
  },
})
</script>
