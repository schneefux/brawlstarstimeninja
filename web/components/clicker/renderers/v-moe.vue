<template>
  <card
    v-if="measurements.some(m => m.id == 'picks') && dimensions.length == 1 && dimensions[0].id == 'brawler' && data.length > 0"
    v-bind="$attrs"
    title="Margin of error"
    size="w-40"
    dense
  >
    <p
      slot="content"
      class="text-center leading-none"
    >
      <span
        :class="['font-bold text-xl', {
          'text-green-400': moe <= 0.01,
          'text-orange-400': moe > 0.01 && moe <= 0.025,
          'text-red-400': moe > 0.025,
        }]"
      >{{ moePercent }}</span>
      <br>
      <span class="text-sm">
        <template v-if="moe <= 0.005">
          (perfect accuracy)
        </template>
        <template v-if="moe > 0.005 && moe <= 0.01">
          (good accuracy)
        </template>
        <template v-if="moe > 0.01 && moe <= 0.025">
          (mediocre accuracy)
        </template>
        <template v-if="moe > 0.025">
          (poor accuracy)
        </template>
      </span>
    </p>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
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
    moe(): number {
      // margin of error
      // moe = z * standard error
      // for binomial (normal approximation):
      // moe = z * Math.sqrt(p*(1-p)/n)
      // worst case, p=50%
      // best case, n = sample / brawlers
      // (assumes we are slicing Brawlers)
      const sample = this.data.reduce((agg, c) => agg + c.measurementsRaw.picks, 0)
      return 1.68 * Math.sqrt(0.5 * (1 - 0.5) / (sample / this.totalBrawlers))
    },
    moePercent(): string {
      return (this.moe * 100).toFixed(2) + '%'
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers as number,
    })
  },
})
</script>
