<template>
  <page title="Brawl Stars Meta Dashboard">
    <c-dashboard
      :config="config"
      :default-cube="cube"
      :default-slices="slices"
      :default-dimensions="['brawler']"
      :default-measurements="['winRateAdj']"
    >
      <template v-slot:[`slices.season`]="data">
        <s-season v-bind="data"></s-season>
      </template>
      <template v-slot:[`slices.map`]="data">
        <s-mode-map v-bind="data"></s-mode-map>
      </template>
      <template v-slot:[`slices.ally`]="data">
        <s-ally v-bind="data"></s-ally>
      </template>
      <template v-slot:[`slices.powerplay`]="data">
        <s-powerplay v-bind="data"></s-powerplay>
      </template>
      <template v-slot:[`slices.trophies`]="data">
        <s-trophies v-bind="data"></s-trophies>
      </template>
      <template v-slot:[`dimensions.brawler`]="data">
        <d-brawler v-bind="data"></d-brawler>
      </template>
      <template v-slot:[`dimensions.team`]="data">
        <d-team v-bind="data"></d-team>
      </template>
      <template v-slot:[`dimensions.starpower`]="data">
        <d-starpower v-bind="data"></d-starpower>
      </template>
      <template v-slot:[`dimensions.gadget`]="data">
        <d-gadget v-bind="data"></d-gadget>
      </template>
      <template v-slot:[`dimensions.mode`]="data">
        <d-mode v-bind="data"></d-mode>
      </template>
      <template v-slot:visualisations="data">
        <v-sample-size v-bind="data"></v-sample-size>
        <v-last-update v-bind="data"></v-last-update>
        <v-moe v-bind="data"></v-moe>
        <v-gini v-bind="data"></v-gini>
      </template>
    </c-dashboard>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { MetaInfo } from 'vue-meta'
import config, { SliceValue } from '~/lib/cube'
import CDashboard from '@/components/clicker/c-dashboard.vue'
import DBrawler from '@/components/clicker/renderers/d-brawler.vue'
import DTeam from '@/components/clicker/renderers/d-team.vue'
import BrawlerTeam from '@/components/brawler/brawler-team.vue'
import DStarpower from '@/components/clicker/renderers/d-starpower.vue'
import DGadget from '@/components/clicker/renderers/d-gadget.vue'
import DMode from '@/components/clicker/renderers/d-mode.vue'
import DMap from '@/components/clicker/renderers/d-map.vue'
import SModeMap from '@/components/clicker/renderers/s-mode-map.vue'
import SAlly from '@/components/clicker/renderers/s-ally.vue'
import SSeason from '@/components/clicker/renderers/s-season.vue'
import SPowerplay from '@/components/clicker/renderers/s-powerplay.vue'
import STrophies from '@/components/clicker/renderers/s-trophies.vue'
import VGini from '@/components/clicker/renderers/v-gini.vue'
import VLastUpdate from '@/components/clicker/renderers/v-last-update.vue'
import VMoe from '@/components/clicker/renderers/v-moe.vue'
import VSampleSize from '@/components/clicker/renderers/v-sample-size.vue'

export default Vue.extend({
  components: {
    CDashboard,
    DBrawler,
    DTeam,
    BrawlerTeam, // dependency of DTeam
    DStarpower,
    DGadget,
    DMode,
    DMap,
    SModeMap,
    SAlly,
    SSeason,
    SPowerplay,
    STrophies,
    VGini,
    VLastUpdate,
    VMoe,
    VSampleSize,
  },
  head(): MetaInfo {
    return {
      link: [ {
        // do not differentiate by query strings (slices)
        rel: 'canonical',
        href: this.$route.path,
      } ],
    }
  },
  data() {
    return {
      cube: 'map',
      config,
      slices: this.$clicker.defaultSlices('map') as SliceValue,
    }
  },
  asyncData({ query, $clicker, route }) {
    const cube = query['cube'] as string || 'map'
    return {
      cube,
      slices: $clicker.routeToSlices(route, $clicker.defaultSlices(cube)),
    }
  },
})
</script>
