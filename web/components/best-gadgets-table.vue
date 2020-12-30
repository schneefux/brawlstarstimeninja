<template>
  <c-query
    :config="config"
    :dimensions-ids="['gadget']"
    :measurements-ids="['winRateAdj', 'picks']"
    :slices-values="{ withGadget: [true] }"
    sort-id="winRateAdj"
    cube-id="gadget"
  >
    <template v-slot="data">
      <v-table
        title="Best Gadgets in Brawl Stars"
        :link="dashboardLink"
        v-bind="data"
        class="mt-4"
      >
        <template v-slot:[`dimensions.gadget`]="data">
          <d-gadget v-bind="data"></d-gadget>
        </template>
      </v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import Vue from 'vue'
import { RawLocation } from 'vue-router'
import VTable from '@/components/clicker/visualisations/v-table.vue'
import DGadget from '@/components/clicker/renderers/d-gadget.vue'
import CQuery from '@/components/clicker/c-query.vue'
import config from '@/lib/cube'

export default Vue.extend({
  components: {
    VTable,
    DGadget,
    CQuery,
  },
  inheritAttrs: false,
  computed: {
    dashboardLink(): RawLocation {
      return {
        path: '/dashboard',
        query: {
          cube: 'gadget',
        },
      }
    },
    config() {
      return config
    },
  },
})
</script>
