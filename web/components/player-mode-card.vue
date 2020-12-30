<template>
  <event-card
    :mode="mode"
    v-bind="$attrs"
  >
    <div slot="content">
      <dl class="flex">
        <dd class="font-semibold">
          {{ stats.picks > 5 ? commonMeasurements.winRate.formatter(stats.winRate) : '?' }}
        </dd>
        <dt class="ml-1">
          {{ commonMeasurements.winRate.name }}
        </dt>
      </dl>
      <p class="text-xs">
        {{ stats.wins }} Wins / {{ stats.losses }} Losses</p>
      <div
        v-if="recommendedBrawlers.length > 0"
        class="flex justify-between md:flex-row-reverse md:justify-end my-3 h-32"
      >
        <div class="md:ml-2 w-full">
          <div>
            <h6 class="font-semibold">{{ activeMap.map }}</h6>
            <p class="text-xs">Recommended for you:</p>
          </div>
          <ol class="flex mt-2 w-32">
            <li
              v-for="brawler in recommendedBrawlers"
              :key="brawler"
              class="flex-shrink-0 w-10 h-12 leading-none mr-1 bg-gray-800 text-center"
            >
              <router-link
                :to="'/tier-list/brawler/' + brawlerId({ name:  brawler })"
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
          </ol>
        </div>
        <div class="w-24 flex flex-col justify-center">
          <media-img
            :path="'/maps/' + activeMap.id"
            size="384"
            clazz="px-1"
            ztyle="max-height: 100%;"
          ></media-img>
          <b-button
            tag="router-link"
            :to="`/tier-list/mode/${camelToKebab(activeMap.mode)}/map/${slugify(activeMap.map)}`"
            class="mx-auto"
            primary
            xs
          >
            Open
          </b-button>
        </div>
      </div>
      <div v-else class="mt-2">
        <b-button
          tag="router-link"
          :to="`/tier-list/mode/${camelToKebab(mode)}`"
          primary
          xs
        >
          Open Tier List
        </b-button>
      </div>
    </div>
    <div class="absolute top-0 right-0 mr-6 my-4">
      <media-img
        :path="'/modes/' + mode + '/icon'"
        :alt="mode"
        size="120"
        clazz="w-12 mr-1"
      ></media-img>
    </div>
  </event-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { formatMode, getBestBrawlers, capitalize, brawlerId } from '~/lib/util'
import { MapMetaMap, MapMeta } from '~/model/MetaEntry'
import { Brawler, Battle } from '~/model/Api'
import { camelToKebab, slugify } from '@/lib/util'
import { commonMeasurements } from '~/lib/cube'

interface Row {
  picks: number
  battle_victory: number
}

interface Stats {
  winRate: number
  picks: number
  wins: number
  losses: number
}

interface MapWithId extends MapMeta {
  id: string
}

export default Vue.extend({
  inheritAttrs: false,
  props: {
    playerTag: {
      type: String,
      required: true
    },
    mode: {
      type: String,
      required: true,
    },
    battles: {
      type: Array as PropType<Battle[]>,
      default: []
    },
    playerBrawlers: {
      type: Array as PropType<Brawler[]>,
      required: true,
    },
    activeMapMeta: {
      type: Object as PropType<MapMetaMap>,
      required: true,
    },
    enableClickerStats: {
      type: Boolean,
      required: true
    },
  },
  data() {
    return {
      data: {} as Row,
    }
  },
  watch: {
    enableClickerStats: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    if (!this.enableClickerStats) {
      return
    }

    const data = await this.$clicker.query('player.winrates.mode',
      'battle',
      [],
      ['picks', 'battle_victory'],
      {
        ...this.$clicker.defaultSlicesRaw('battle'),
        battle_event_mode: [this.mode],
        player_tag: [this.playerTag],
      },
      { sort: { picks: 'desc' }, cache: 60 })

    this.data = data.data[0]
  },
  computed: {
    stats(): Stats {
      if (this.data.picks != undefined) {
        const wins = Math.floor(this.data.battle_victory * this.data.picks)
        const losses = Math.floor((1 - this.data.battle_victory) * this.data.picks)
        return {
          winRate: this.data.battle_victory,
          picks: this.data.picks,
          wins,
          losses,
        }
      }

      const battles = this.battles.filter((b) => b.event.mode == this.mode)
      const picks = battles.length
      const wins = battles.filter(b => b.victory).length
      const losses = picks - wins
      const winRate = picks == 0 ? 0 : wins / picks
      return {
        winRate,
        picks,
        wins,
        losses,
      }
    },
    activeMap(): MapWithId|undefined {
      // TODO there might be a second one when Power Play is online
      const activeMap = Object.entries(this.activeMapMeta).filter(([id, meta]) => meta.mode == this.mode)[0]
      if (activeMap == undefined) {
        return undefined
      }
      return {
        id: activeMap[0],
        ...activeMap[1],
      }
    },
    recommendedBrawlers(): string[] {
      let recommendedBrawlers = [] as string[]
      if (this.activeMap !== undefined) {
        // score =
        //   index [ brawlers owned by player, worst first ]
        //     *
        //   index [ brawler in map meta, best first ]
        const worstBrawlers = this.playerBrawlers.slice()
          .sort((b1, b2) => b1.trophies - b2.trophies)
        const bestBrawlers = getBestBrawlers(Object.values(this.activeMap.brawlers).map(v => ({ ...v, id: v.name })))
        recommendedBrawlers = worstBrawlers
          .map((worstBrawler) => {
            const bestBrawlerIndex = bestBrawlers.findIndex(b => b.name.toLowerCase() == worstBrawler.name.toLowerCase())
            return {
              brawler: worstBrawler,
              score: (worstBrawler.trophies + 1) * (bestBrawlerIndex / bestBrawlers.length + 1),
            }
          })
          .sort((r1, r2) => r1.score - r2.score)
          .map((r) => r.brawler.name.toLowerCase())
          .slice(0, 3)
      }

      return recommendedBrawlers
    },
    mediaUrl(): string {
      return process.env.mediaUrl!
    },
    formatMode() {
      return formatMode
    },
    commonMeasurements() {
      return commonMeasurements
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
