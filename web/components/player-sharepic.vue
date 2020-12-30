<template>
  <sharepic @done="done">
    <card class="m-0! p-0!">
      <div
        slot="content"
        class="flex flex-wrap"
      >
        <div class="w-full flex items-center">
          <img
            :src="`${mediaUrl}/avatars/${player.icon.id}.png?size=112`"
            class="w-14 mr-4"
          >
          <span class="text-4xl font-semibold relative text-yellow-400">
            {{ player.name }}
          </span>

          <div class="ml-auto flex items-center">
            <span class="mb-1 text-xl">Rating</span>
            <div
              class="ml-3 border-2 border-red-600 text-yellow-400 font-bold text-4xl rounded-full h-12 w-12 text-center flex justify-center items-center"
            >
              <span class="mb-1">
                {{ accountRating }}
              </span>
            </div>
          </div>
        </div>

        <div class="w-1/2 pr-1">
          <p
            v-if="player.club.tag != undefined"
            class="w-full text-center mt-1 text-2xl"
          >
            <span class="mx-1 text-red-500 font-semibold">
              {{ player.club.name }}
            </span>
            Club
          </p>

          <div class="flex text-3xl">
            <span class="w-24 text-right text-yellow-400 font-bold">
              {{ Math.floor(player.hoursSpent) }}
            </span>
            <span class="ml-2">
              hours spent
            </span>
          </div>

          <div class="flex text-3xl">
            <span class="w-24 text-right text-yellow-400 font-bold">
              {{ Math.floor(player.trophies) }}
            </span>
            <span class="ml-2">
              Trophies
            </span>
          </div>

          <history-graph
            :player-tag="player.tag"
            class="mt-2 -ml-4 w-80 h-28"
          ></history-graph>
        </div>

        <div class="w-1/2 pl-1">
          <div class="w-full flex justify-center">
            <span class="text-3xl text-yellow-400 font-bold">
              {{ Math.floor(winRate * 100) }}%
            </span>
            <div class="ml-2 flex flex-col justify-center items-center">
              <span class="text-xl">
                Win Rate
              </span>
              <span class="text-xs -mt-1">
                ({{ totalBattles }} Battles)
              </span>
            </div>
          </div>

          <div>
            <span class="text-lg">Best Brawlers:</span>

            <div class="w-full flex flex-wrap">
              <div
                v-for="brawler in bestBrawlers.slice(0, 6)"
                :key="brawler.id"
                class="flex items-center w-32 h-12 mt-1 mx-1"
              >
                <div class="w-full h-full text-center">
                  <img
                    :src="`${mediaUrl}/brawlers/${brawler.id}/model.png?size=96`"
                    class="w-auto h-full mx-auto"
                  >
                </div>
                <div class="w-full flex flex-wrap justify-center">
                  <div class="w-full flex items-center">
                    <img
                      src="~/assets/images/icon/trophy_optimized.png"
                      class="h-4 inline"
                    >
                    <span class="ml-1 text-lg font-bold">
                      {{ brawler.trophies }}
                    </span>
                  </div>
                  <span class="w-full -mt-2 capitalize text-center text-xs">
                    {{ brawler.name.toLowerCase() }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p class="-mr-2 -mt-1 text-xs text-right text-gray-400">
            brawltime.ninja
          </p>
        </div>
      </div>
    </card>
  </sharepic>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Player } from '../model/Brawlstars'
import { TrophiesRow } from '../model/Clicker'
import { Brawler } from '@/model/Api'

export default Vue.extend({
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
    winRate: {
      type: Number,
      required: true
    },
    totalBattles: {
      type: Number,
      required: true
    },
    accountRating: {
      type: String,
      required: true
    },
  },
  computed: {
    bestBrawlers(): Brawler[] {
      return Object.entries(this.player.brawlers)
        .map(([id, brawler]) => ({
          ...brawler,
          id,
        }))
        .sort((b1, b2) => b2.trophies - b1.trophies)
    },
    mediaUrl(): string {
      return process.env.mediaUrl!
    },
  },
  methods: {
    done() {
      this.$gtag.event('click', {
        'event_category': 'profile',
        'event_label': 'share',
      })
    },
  },
})
</script>
