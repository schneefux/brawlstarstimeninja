<template>
  <event-card
    :mode="mode"
    :map="map"
    :id="id"
  >
    <ol slot="content" class="flex justify-center my-2">
      <li
        v-for="brawler in recommendedBrawlers"
        :key="brawler"
        class="flex-shrink-0 w-10 h-12 leading-none mr-2 bg-gray-800 text-center"
      >
        <router-link
          :to="'/tier-list/brawler/' + brawlerId({ name: brawler })"
        >
          <media-img
            :path="'/brawlers/' + brawlerId({ name: brawler }) + '/avatar'"
            :alt="brawler"
            size="160"
            clazz="h-8"
          ></media-img>
          <span class="text-xs">{{ capitalize(brawler) }}</span>
        </router-link>
      </li>
      <div class="flex items-center">
        <b-button
          :to="`/tier-list/mode/${camelToKebab(mode)}/map/${slugify(map)}`"
          primary
          xs
          prefetch
        >
          Open Tier List
        </b-button>
      </div>
    </ol>
  </event-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { brawlerId, camelToKebab, capitalize, formatMode, slugify } from '@/lib/util'
import { Player } from '@/model/Api'

interface Row {
  brawler_name: string
  wins: number
}

export default Vue.extend({
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
    mode: {
      // camel case
      type: String,
      required: true
    },
    map: {
      type: String,
      required: true,
    },
    id: {
      type: [String, Number],
      required: true
    },
  },
  data() {
    return {
      data: [] as Row[],
    }
  },
  async fetch() {
    const data = await this.$clicker.query('meta.map.quick-tip', 'map',
      ['brawler_name'],
      ['wins'],
      {
        ...this.$clicker.defaultSlicesRaw('map'),
        battle_event_map: [this.map],
        battle_event_mode: [this.mode],
      },
      { cache: 60*10 })

    this.data = data.data
      .map(b => ({ ...b }))
      .sort((b1, b2) => b1.wins - b2.wins)
  },
  computed: {
    recommendedBrawlers(): string[] {
      if (!('brawlers' in this.player)) {
        return []
      }
      // score =
      //   index [ brawlers owned by player, worst first ]
      //     *
      //   index [ brawler in map meta, best first ]
      const worstBrawlers = Object.values(this.player.brawlers)
        .sort((b1, b2) => b1.trophies - b2.trophies)
      const bestBrawlers = this.data
      return worstBrawlers
        .map((worstBrawler) => {
          const bestBrawlerIndex = bestBrawlers.findIndex(b => b.brawler_name.toLowerCase() == worstBrawler.name.toLowerCase())
          return {
            brawler: worstBrawler,
            score: (worstBrawler.trophies + 1) * (bestBrawlerIndex / bestBrawlers.length + 1),
          }
        })
        .sort((r1, r2) => r1.score - r2.score)
        .map((r) => r.brawler.name.toLowerCase())
        .slice(0, 4)
    },
    mediaUrl(): string {
      return process.env.mediaUrl!
    },
    formatMode() {
      return formatMode
    },
    brawlerId() {
      return brawlerId
    },
    capitalize() {
      return capitalize
    },
    camelToKebab() {
      return camelToKebab
    },
    slugify() {
      return slugify
    },
  },
})
</script>
