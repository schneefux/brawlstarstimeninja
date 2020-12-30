<template>
  <dl class="flex justify-between">
    <dt class="text-center mr-1">
      <span class="text-lg font-semibold">Balance Rating:</span><br>
      <span class="text-xs">How diverse is the Meta?</span>
    </dt>
    <dd class="text-center ml-1">
      <span
        class="text-lg font-bold"
        :class="{
          'text-red-500': score > 0.4,
          'text-orange-400': score > 0.3 && score <= 0.4,
          'text-green-400': score <= 0.3,
        }"
      >{{ score == undefined ? '?' : scoreWords[Math.floor(score * 10)] }}</span><br>
      <span class="text-xs">Gini Coefficient: {{ score == undefined ? '?' : score.toFixed(2) }}</span>
    </dd>
  </dl>
</template>

<script lang="ts">
import Vue from 'vue'

interface Row {
  picks_weighted: number
}

export default Vue.extend({
  props: {
    mode: {
      type: String,
    },
    map: {
      type: String,
    },
    season: {
      type: String,
    },
  },
  data() {
    return {
      data: [] as Row[],
    }
  },
  watch: {
    map: '$fetch',
    mode: '$fetch',
    season: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('meta.map', 'map',
      ['brawler_name'],
      ['picks_weighted'],
      {
        ...this.$clicker.defaultSlicesRaw('map'),
        ...(this.map != undefined ? {
          battle_event_map: [this.map],
        } : {}),
        ...(this.mode != undefined ? {
          battle_event_mode: [this.mode],
        } : {}),
        ...(this.season != undefined ? {
          trophy_season_end: undefined,
          trophy_season_end_exact: [this.season],
        } : {}),
      },
      { cache: 60*10 })
    this.data = data.data
  },
  computed: {
    score(): number|undefined {
      if (this.data.length == 0) {
        return undefined
      }
      const getStat = (r: Row) => r.picks_weighted

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
    scoreWords(): string[] {
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
