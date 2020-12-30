<template>
  <card
    v-if="measurements.some(m => m.id == 'picks') && dimensions.length == 1 && dimensions[0].id == 'brawler' && data.length > 0"
    v-bind="$attrs"
    title="Balance Rating"
    size="w-48"
    dense
  >
    <b-button
      slot="preview"
      to="/faq/measuring-map-quality"
      class="my-px"
      dark
      xs
    >?</b-button>
    <p
      slot="content"
      class="text-center leading-none"
    >
      <span
        class="text-lg font-bold"
        :class="{
          'text-red-400': giniScore > 0.4,
          'text-orange-400': giniScore > 0.3 && giniScore <= 0.4,
          'text-green-400': giniScore <= 0.3,
        }"
      >{{ giniScore == undefined ? '?' : giniScoreWords[Math.floor(giniScore * 10)] }}</span>
      <br>
      <span class="text-xs">Gini Coefficient: {{ giniScore == undefined ? '?' : giniScore.toFixed(2) }}</span>
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
    giniScore(): number {
      const getStat = (r: MetaGridEntry) => r.measurementsRaw.picks

      // calculate Gini coefficient
      let absoluteDifference = 0
      let arithmeticMean = 0
      for (const e1 of this.data) {
        arithmeticMean += getStat(e1) / this.data.length
        for (const e2 of this.data) {
          absoluteDifference += Math.abs(getStat(e1) - getStat(e2))
        }
      }
      return absoluteDifference / (2 * Math.pow(this.data.length, 2) * arithmeticMean)
    },
    giniScoreWords(): string[] {
      // results from a hand-drawn sample of different maps and modes:
      // 25%ile 0.225
      // 50%ile 0.32
      // 75%ile 0.425
      // words chosen from http://www.mcdonald.me.uk/storytelling/lichert_article.htm
      return [
        'Amazing',
        'Excellent',
        'Good',
        'Fair',
        'Mediocre',
        'Poor',
        'Bad',
        'Awful',
        'Awful',
        'Awful',
      ]
    },
  },
})
</script>
