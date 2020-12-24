<template>
  <card v-bind="$attrs">
    <b-table
      slot="content"
      :columns="columns"
      :rows="rows"
      :page-size="pageSize"
      id-key="id"
      class="font-semibold"
      ranked
    >
      <template v-slot:index="{ index, row }">
        {{ row.sampleSize < sampleSizeThreshold ? '?' : index }}
      </template>
      <template v-slot:[`dimensions.brawler.name`]="{ row }">
        <meta-brawler-renderer :row="row"></meta-brawler-renderer>
      </template>
      <template v-slot:[`dimensions.brawlers.name`]="{ row }">
        <meta-brawlers-renderer :row="row"></meta-brawlers-renderer>
      </template>
    </b-table>
  </card>
</template>

<script lang="ts">
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons'
import Vue, { PropType } from 'vue'
import { metaStatMaps, MetaGridEntry, brawlerId, compare1, dimensionLabel } from '../lib/util'
import { Column } from './b-table.vue'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    entries: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true,
    },
    dimension: {
      type: String,
      required: true
    },
    measurement: {
      type: String,
      required: true
    },
    sampleSizeThreshold: {
      type: Number,
      default: 200
    },
    pageSize: {
      type: Number,
      default: 15
    },
  },
  computed: {
    columns(): Column[] {
      return [{
        title: dimensionLabel[this.dimension],
        key: `dimensions.${this.dimension}`,
      }, {
        title: metaStatMaps.labels[this.measurement],
        key: `measurementsFormatted.${this.measurement}`,
      }]
    },
    rows(): unknown[] {
      const aboveThreshold = this.entries.filter(e => e.measurements.picks >= this.sampleSizeThreshold)
      const belowThreshold = this.entries.filter(e => e.measurements.picks < this.sampleSizeThreshold)
      return aboveThreshold
        .concat(belowThreshold)
    },
    metaStatMaps() {
      return metaStatMaps
    },
  },
})
</script>
