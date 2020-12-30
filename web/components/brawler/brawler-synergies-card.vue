<template>
  <accordeon-card
    :title="brawler + ' with another Brawler'"
    :icon="'/brawlers/' + brawlerId({ name: brawler }) + '/avatar'"
    :pages="Math.ceil(data.length / (rowSize * rowsPerPage)) - 1"
    sm
  >
    <template v-slot:content="{ page }">
      <p class="h-18 mb-2">
        {{ description }}
      </p>
      <template
        v-for="p in (page + 1)"
      >
        <template
          v-for="row in rowsPerPage"
        >
          <brawlers-row
            v-if="$fetchState.pending || data.length >= (p - 1) * (rowSize * rowsPerPage) + (row - 1) * rowSize"
            :key="row + '-' + p"
            :loading="$fetchState.pending"
            :brawlers="data.slice((p - 1) * (rowSize * rowsPerPage) + (row - 1) * rowSize, (p - 1) * (rowSize * rowsPerPage) + row * rowSize)"
            class="mx-auto h-16 w-72"
          >
            <template v-slot="{ brawler }">
              <template v-if="brawler.picks >= sampleSizeThreshold">
                {{ commonMeasurements.winRateDiff.formatter(brawler.battle_victory) }}
                {{ commonMeasurements.winRateDiff.nameShort }}
              </template>
              <template v-else>
                ?
              </template>
            </template>
          </brawlers-row>
        </template>
      </template>
    </template>
  </accordeon-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { commonMeasurements } from '~/lib/cube'
import { PicksWins } from '~/plugins/clicker'
import { brawlerId, capitalizeWords, formatList } from '@/lib/util'

interface Row {
  brawler_name: string
  picks: number
  battle_victory: number
}

export default Vue.extend({
  props: {
    brawler: {
      type: String,
      required: true
    },
    sampleSizeThreshold: {
      type: Number,
      default: 1000
    },
    mode: {
      type: String,
      required: false
    },
    map: {
      type: String,
      required: false
    },
    id: {
      type: String,
      required: false
    },
  },
  data() {
    return {
      data: [] as Row[],
      rowSize: 4,
      rowsPerPage: 2,
    }
  },
  computed: {
    brawlerId() {
      return brawlerId
    },
    commonMeasurements() {
      return commonMeasurements
    },
    description(): string {
      if (this.data.length < 5) {
        return ''
      }
      const formatName = (r: Row) => capitalizeWords(r.brawler_name.toLowerCase())
      const topText = formatList(this.data.slice(0, 4).map(formatName))
      const bottomText = formatList(this.data.slice(-3).map(formatName))
      return `${this.brawler} performs best together with ${topText}. Playing with ${bottomText} puts ${this.brawler} at disadvantage.`
    },
  },
  fetchDelay: 0,
  fetchOnServer: false,
  async fetch() {
    /*
      Calculate the difference between
      assumed independence: P(brawler,ally) = P(brawler) * P(ally) = H(brawler) * H(ally) / H^2
      and observation:      P(brawler,ally) = H(brawler,ally) / H
    */

    const bayesStats = await this.$clicker.calculateBayesSynergies('meta.synergy.widget', this.brawler)

    const data: Row[] = []
    const brawler = this.brawler.toUpperCase()
    bayesStats.pairData.get(brawler)!.forEach((picksWins, allyBrawler) => {
      if (brawler == allyBrawler) {
        return
      }

      const hBrawler = bayesStats.data.get(brawler)!
      const hAlly = bayesStats.data.get(allyBrawler)!
      const hBrawlerAlly = picksWins
      const h = bayesStats.totals
      const h2: PicksWins = {
        wins: bayesStats.totals.wins * bayesStats.totals.wins,
        picks: bayesStats.totals.picks * bayesStats.totals.picks,
      }

      const assumption: PicksWins = {
        picks: hBrawler.picks * hAlly.picks / h2.picks,
        wins: hBrawler.wins * hAlly.wins / h2.wins,
      }
      const observation: PicksWins = {
        picks: hBrawlerAlly.picks / h.picks,
        wins: hBrawlerAlly.wins / h.wins,
      }

      data.push({
        brawler_name: allyBrawler,
        picks: bayesStats.sampleSize,
        battle_victory: observation.wins / observation.picks - assumption.wins / assumption.picks,
      })
    })

    data.sort((e1, e2) => e2.picks >= this.sampleSizeThreshold && e1.picks >= this.sampleSizeThreshold ? e2.battle_victory - e1.battle_victory : e2.picks - e1.picks)
    this.data = data
  },
})
</script>
