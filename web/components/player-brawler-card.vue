<template>
  <brawler-card
    :title="title"
    :brawlers="[brawler.name]"
    :brawler-id="brawlerId"
    elevation="2"
  >
    <table slot="stats">
      <tbody>
        <tr>
          <td class="text-center">
            <img
              src="~/assets/images/icon/leaderboards_optimized.png"
              class="card-prop-icon"
            >
          </td>
          <td class="card-prop-value text-right pr-1">
            {{ brawler.rank }}
          </td>
          <td class="card-prop-label">
            Rank
          </td>
        </tr>
        <tr>
          <td class="text-center">
            <img
              src="~/assets/images/icon/trophy_optimized.png"
              class="card-prop-icon"
            >
          </td>
          <td class="card-prop-value text-right pr-1">
            {{ brawler.trophies }}
          </td>
          <td class="card-prop-label">
            Trophies
          </td>
        </tr>
        <tr>
          <td class="text-center">
            <img
              :src="brawler.power < 10 ? require('~/assets/images/icon/powerpoint_optimized.png') : require('~/assets/images/icon/starpower_optimized.png')"
              class="card-prop-icon"
            >
          </td>
          <td class="card-prop-value text-right pr-1">
            {{ brawler.power }}
          </td>
          <td class="card-prop-label">
            Power Level
          </td>
        </tr>
      </tbody>
    </table>

    <div
      slot="actions"
      class="w-full"
    >
      <b-button
        @click="open = !open"
        primary
        class="w-full"
      >
        {{ open ? 'Hide' : 'Show' }} Details
      </b-button>
      <div v-if="open">
        <history-graph
          :brawler="brawler.name"
          :player-tag="playerTag"
          class="mt-3 h-32"
        ></history-graph>
        <div class="my-2 text-gray-200">
          <table class="mt-4 w-full font-semibold leading-none">
            <tbody>
              <tr class="flex text-2xl">
                <td class="w-1/2 pr-1 text-right">Win Rate</td>
                <td class="w-1/2 pl-1 text-left text-yellow-400">{{ picks == 0 ? '?' : Math.round(this.winrate * 100) + '%' }}</td>
              </tr>
              <tr class="flex">
                <td class="w-1/2 pr-1 text-right">Highest Trophies</td>
                <td class="w-1/2 pl-1 text-left text-yellow-400">{{ brawler.highestTrophies }}</td>
              </tr>
            </tbody>
          </table>
          <div
            v-if="picks > 0"
            class="flex justify-center"
          >
            <span class="w-16 text-green-500 text-right">
              {{ Math.floor(this.winrate * this.picks) }}W
            </span>
            <span class="px-1">-</span>
            <span class="w-16 text-red-500 text-left">
              {{ Math.floor((1-this.winrate) * this.picks) }}L
            </span>
          </div>
        </div>
      </div>
    </div>
  </brawler-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Brawler } from '~/model/Api'
import { TrophiesRow } from '~/model/Clicker'
import { brawlerId, capitalizeWords } from '~/lib/util'

interface BrawlerWithId extends Brawler {
  id: string
}

export default Vue.extend({
  props: {
    playerTag: {
      type: String,
      required: true
    },
    brawler: {
      type: Object as PropType<BrawlerWithId>,
      required: true,
    },
    defaultOpen: {
      type: Boolean,
      default: false
    },
    enableClickerStats: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      open: this.defaultOpen,
      winrate: 0,
      picks: 0,
    }
  },
  watch: {
    open: '$fetch',
    enableClickerStats: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    if (!this.open || !this.enableClickerStats) {
      return
    }

    const battleData = await this.$clicker.query('player.winrates.brawler',
      'battle',
      [],
      ['picks', 'battle_victory'],
      {
        ...this.$clicker.defaultSlicesRaw('battle'),
        // TODO use ID
        brawler_name: [this.brawler.name.toUpperCase()],
        player_tag: [this.playerTag],
      },
      { cache: 60 })
    this.winrate = battleData.data[0].battle_victory
    this.picks = battleData.data[0].picks
  },
  computed: {
    brawlerId(): string {
      return brawlerId({ name: this.brawler.name })
    },
    title(): string {
      return capitalizeWords(this.brawler.name.toLowerCase())
    },
  },
})
</script>
