<template>
  <div class="flex flex-wrap justify-center">
    <card
      :title="`About &quot;${metaStatMaps.labels[measurement]}&quot;`"
      full-height
      dense
      class="w-full"
    >
      <p
        slot="content"
        class="md:h-16"
      >
        {{ metaStatMaps.descriptions[measurement] }}
      </p>
    </card>

    <card
      v-if="sample == 0"
      full-height
      dense
      class="w-full"
    >
      <p
        slot="content"
        class="text-red-400"
      >
        No data!
        Select a different filter.
      </p>
    </card>

    <card
      v-if="sample > 0"
      title="Sample Size"
      class="w-1/2"
      full-height
      dense
    >
      <p
        slot="content"
        class="text-lg"
      >
        {{ formatSI(sample) }} Battles
      </p>
    </card>

    <card
      v-if="users != undefined"
      title="Sample Size"
      class="w-1/2"
      full-height
      dense
    >
      <p
        slot="content"
        class="text-lg"
      >
        {{ formatSI(users) }} Users
      </p>
    </card>

    <card
      v-if="sample > 0 && timestamp != undefined"
      title="Last Update"
      class="w-1/2"
      full-height
      dense
    >
      <p
        slot="content"
        class="text-lg"
      >
        {{ lastUpdate }}
      </p>
    </card>

    <card
      v-if="sample > 0"
      title="Margin of error"
      class="w-1/2"
      full-height
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

    <card
      v-if="['map'].includes(cube) && sample > 0"
      title="Balance Rating"
      class="w-1/2"
      full-height
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
  </div>
</template>

<script lang="ts">
import { formatDistanceToNow, parseISO } from 'date-fns'
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import { formatSI, MetaGridEntry, metaStatMaps } from '~/lib/util'

export default Vue.extend({
  props: {
    cube: {
      type: String,
      required: true
    },
    data: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true
    },
    sample: {
      type: Number,
      required: true
    },
    users: {
      type: Number,
    },
    timestamp: {
      type: String,
    },
    measurement: {
      type: String,
      required: true
    },
  },
  computed: {
    lastUpdate(): string {
      const timestamp = parseISO(this.timestamp)
      if (timestamp.valueOf() == 0) {
        return 'never'
      }
      return formatDistanceToNow(timestamp, { addSuffix: true })
    },
    moe(): number {
      // margin of error
      // moe = z * standard error
      // for binomial (normal approximation):
      // moe = z * Math.sqrt(p*(1-p)/n)
      // worst case, p=50%
      // best case, n = sample / brawlers
      // (TODO: Assumes we are slicing Brawlers!)
      return 1.68 * Math.sqrt(0.5 * (1 - 0.5) / (this.sample / this.totalBrawlers))
    },
    moePercent(): string {
      return (this.moe * 100).toFixed(2) + '%'
    },
    giniScore(): number {
      const getStat = (r: MetaGridEntry) => r.measurements.picks

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
    formatSI() {
      return formatSI
    },
    metaStatMaps() {
      return metaStatMaps
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers as number,
    })
  },
})
</script>
