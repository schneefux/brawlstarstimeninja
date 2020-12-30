<template>
  <card
    v-if="measurements.some(m => m.id == 'picks')"
    v-bind="$attrs"
    title="Sample Size"
    size="w-32"
    dense
  >
    <p
      v-if="sample == 0"
      slot="content"
      class="text-red-400"
    >
      No data!
      Select a different filter.
    </p>
    <p
      v-else
      slot="content"
      class="text-lg"
    >
      {{ sampleFormatted }} Battles
    </p>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Dimension, Measurement } from '~/lib/cube'
import { formatSI, MetaGridEntry } from '~/lib/util'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    data: {
      type: Array as PropType<MetaGridEntry[]>
    },
    dimensions: {
      type: Array as PropType<Dimension[]>,
      required: true
    },
    measurements: {
      type: Array as PropType<Measurement[]>,
      required: true
    },
  },
  computed: {
    sample(): number {
      return this.data.reduce((agg, e) => agg + e.measurementsRaw.picks, 0)
    },
    sampleFormatted(): string {
      return formatSI(this.sample, 2)
    },
  },
})
</script>
