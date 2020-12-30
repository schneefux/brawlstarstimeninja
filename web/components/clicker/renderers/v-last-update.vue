<template>
  <card
    v-if="measurements.some(m => m.id == 'timestamp') && data.length > 0"
    v-bind="$attrs"
    title="Last Update"
    dense
  >
    <p
      slot="content"
      class="text-lg"
    >
      {{ lastUpdate }}
    </p>
  </card>
</template>

<script lang="ts">
import { formatDistanceToNow, parseISO } from 'date-fns'
import Vue, { PropType } from 'vue'
import { Dimension, Measurement } from '~/lib/cube'
import { MetaGridEntry } from '~/lib/util'

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
    lastUpdate(): string {
      const timestamps = this.data
        .map(d => d.measurementsRaw.timestamp)
        .sort() as unknown as string[] // TODO
      const timestamp = parseISO(timestamps[timestamps.length - 1])
      if (timestamp.valueOf() == 0) {
        return 'never'
      }
      return formatDistanceToNow(timestamp, { addSuffix: true })
    },
  },
})
</script>
