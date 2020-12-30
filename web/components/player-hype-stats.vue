<template>
  <div class="relative">
    <div class="items-center justify-center flex flex-wrap md:mx-16 lg:mx-40">
      <div class="mx-auto md:mx-0 flex">
        <dl>
          <dd ref="counter-hours" class="text-5xl text-yellow-400 font-bold">
            ...
          </dd>
          <dt class="text-3xl text-white">
            hours spent
          </dt>
        </dl>
        <nuxt-link
          v-if="rank !== 0"
          to="/leaderboard/hours"
          class="text-4xl -ml-4 text-primary-light font-bold"
        >
          #{{ rank }}
        </nuxt-link>
      </div>

      <div
        v-show="!showAll"
        class="w-full md:hidden mt-1"
      >
        <b-button
          class="relative z-10"
          xs
          primary
          @click="showAll = true"
        >
          &#9660; show fun facts
        </b-button>
      </div>

      <p
        :class="['w-full md:w-auto text-xl my-4 mx-auto', {
          'hidden md:block': !showAll,
        }]"
      >
        which is about
      </p>

      <dl
        :class="['flex flex-wrap justify-between z-20', {
          'hidden md:flex': !showAll,
        }]"
      >
        <div
          v-for="(stat, statName) in funStats"
          :key="statName"
          class="mx-auto px-2 my-3"
        >
          <dd ref="counter-funstats" class="text-3xl text-yellow-400 font-semibold">
            ...
          </dd>
          <dt class="text-2xl text-grey-lighter">
            {{ stat.label }}
          </dt>
        </div>
      </dl>
    </div>

    <player-sharepic
      :player="player"
      :win-rate="winRate"
      :total-battles="totalBattles"
      :account-rating="accountRating"
      class="absolute w-16 top-0 left-0 z-0 -mt-2"
    ></player-sharepic>

    <div class="bigstat-wrapper">
      <dl
        v-if="player.club.tag != undefined"
        class="bigstat-container"
      >
        <div class="bigstat-left text-5vw md:text-4xl!">
          <div style="margin-top: -0.125em">
            [
          </div>
          <dd class="mx-2">
            <nuxt-link
              :to="`/club/${player.club.tag}`"
              class="underline text-red-500 font-semibold text-center"
            >
              {{ player.club.name.replace(/ /g, '&nbsp;') }}
            </nuxt-link>
          </dd>
          <div style="margin-top: -0.125em">
            ]
          </div>
        </div>
        <dt class="bigstat-right bigstat-label text-4xl">
          Club
        </dt>
      </dl>

      <div class="bigstat-container">
        <dl class="flex flex-wrap">
          <dd class="bigstat-left bigstat-number">
            {{ player.trophies.toLocaleString() }}
          </dd>
          <dt class="bigstat-right bigstat-label text-4xl">
            Trophies
          </dt>
        </dl>

        <div class="w-full max-w-xs my-3 md:my-0 md:w-80 relative">
          <history-graph
            v-if="enableClickerStats"
            :player-tag="player.tag"
            class="h-24 md:h-20"
          ></history-graph>
          <span v-else class="italic">
            Come back later to see progress charts
          </span>
        </div>
      </div>

      <dl
        v-if="brawlersUnlocked < totalBrawlers"
        class="bigstat-container"
      >
        <dd class="bigstat-left bigstat-number">
          {{ Math.floor(trophiesGoal).toLocaleString() }}
        </dd>
        <div class="bigstat-right">
          <dt class="bigstat-label w-48 pt-1">
            <span class="text-xl">
              Potential&nbsp;Trophies
            </span>
            <span class="text-sm">
              (with&nbsp;all&nbsp;Brawlers&nbsp;unlocked)
            </span>
          </dt>
        </div>
      </dl>

      <dl
        v-if="winRate !== 0"
        class="bigstat-container"
      >
        <div class="bigstat-left relative">
          <dd class="bigstat-number">
            {{ Math.floor(winRate * 100) }}%
          </dd>
          <button
            @click="recentHelpOpen = true"
            class="bigstat-tooltip__btn"
          >?</button>
        </div>
        <div class="bigstat-right bigstat-label text-xl">
          <dt class="w-24">
            Recent Win&nbsp;Rate
          </dt>
        </div>
        <card
          :class="['absolute z-10', {
            'hidden': !recentHelpOpen,
          }]"
          dense
          xxs
          @click="recentHelpOpen = false"
        >
          <p
            slot="content"
            class="text-left"
          >
            Your last {{ totalBattles }} battles are used for "Recent" statistics. <br>
            The Recent Win Rate takes 3v3 wins and Showdown rankings into account.
          </p>
          <b-button
            slot="actions"
            primary
            xs
            class="mx-auto"
            @click="recentHelpOpen = false"
          >Close</b-button>
        </card>
      </dl>

      <dl
        v-if="trophyRate !== 0"
        class="bigstat-container"
      >
        <dd class="bigstat-left bigstat-number">
          {{ trophyRate.toFixed(2) }}
        </dd>
        <div class="bigstat-right bigstat-label text-xl">
          <dt class="w-24">
            Recent&nbsp;Trophies per&nbsp;battle
          </dt>
        </div>
      </dl>

      <dl class="bigstat-container">
        <div class="bigstat-left relative">
          <dd class="bigstat-number">{{ accountRating }}</dd>
          <button
            @click="ratingHelpOpen = true"
            class="bigstat-tooltip__btn"
          >?</button>
        </div>
        <div class="bigstat-right bigstat-label text-xl">
          <dt class="w-24">
            Account Rating
          </dt>
        </div>
        <card
          :class="['absolute z-20', {
            'hidden': !ratingHelpOpen,
          }]"
          dense
          xxs
          @click="ratingHelpOpen = false"
        >
          <p
            slot="content"
            class="text-left"
          >
            The rating is calculated by comparing your mean Brawler trophies to all player's mean Brawler trophies at season end.
            <ul>
              <li
                v-for="(info, rating) in ratingPercentiles"
                :key="rating"
              >{{ rating }}: Better than {{ info[0] * 100 }}% (up to {{ info[1] }} Trophies)</li>
            </ul>
          </p>
          <b-button
            slot="actions"
            primary
            xs
            class="mx-auto"
            @click="ratingHelpOpen = false"
          >Close</b-button>
        </card>
      </dl>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import { Player, LeaderboardEntry } from '@/model/Api'
import { TrophiesRow } from '../model/Clicker'
import { BattleTotalRow } from './player-battles-stats.vue'

export default Vue.extend({
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
    hoursLeaderboard: {
      type: Array as PropType<LeaderboardEntry[]>,
      default: () => []
    },
    battleTotals: {
      type: Object as PropType<BattleTotalRow>,
      required: false
    },
    enableClickerStats: {
      type: Boolean,
      required: true
    },
  },
  data() {
    return {
      showAll: false,
      ratingHelpOpen: false,
      recentHelpOpen: false,
      ratingPercentiles: {
        // key: percentile, trophy boundary
        '?': [0, 480],
        'D': [0.25, 500],
        'C': [0.375, 520],
        'B': [0.5, 590],
        'A': [0.9, 630],
        'S': [0.95, 730],
        'S+': [0.99, Infinity],
      },
    }
  },
  mounted() {
    if ((<any>process).client) {
      this.$nextTick(() => {
        const playerHours = Math.max(this.player.hoursSpent, 1)
        const animationDuration = 3000
        const frameDuration = 50
        const k = Math.log(playerHours) / (animationDuration / frameDuration)

        let hoursSpent = 0
        const hoursTimer = () => setTimeout(() => {
          hoursSpent += k * (playerHours - hoursSpent)
          if (Math.floor(hoursSpent) >= playerHours - 1) {
            hoursSpent = playerHours
          }

          const counter = this.$refs['counter-hours'] as HTMLElement
          if (counter == undefined) {
            // user navigated to a different page
            return
          }

          counter.textContent = Math.floor(hoursSpent).toString()
          Object.values(this.funStats).forEach((stat, index) => {
            const funCounter = this.$refs['counter-funstats'][index] as HTMLElement
            funCounter.textContent = Math.floor(stat.value(hoursSpent)).toString()
          })

          if (Math.floor(hoursSpent) < playerHours) {
            hoursTimer()
          }
        }, frameDuration)
        hoursTimer()
      })
    }
  },
  computed: {
    rank(): number|undefined {
      const rank = this.hoursLeaderboard.findIndex(e => e.tag == this.player.tag)
      if (rank == undefined) {
        return undefined
      }
      return rank + 1
    },
    brawlersUnlocked(): number {
      return Object.keys(this.player.brawlers).length
    },
    trophiesGoal(): number {
      const brawlerTrophies = [...Object.values(this.player.brawlers)]
        .map(({ trophies }) => trophies)
      brawlerTrophies.sort()
      const medBrawlerTrophies = brawlerTrophies[Math.floor(brawlerTrophies.length / 2)]
      return medBrawlerTrophies * this.totalBrawlers
    },
    trophyRate(): number {
      if (this.battleTotals != undefined && this.battleTotals != undefined) {
        return this.battleTotals.battle_trophy_change || 0
      }

      const trophyChanges = this.player.battles
        .map((battle) => battle.trophyChange!)
        .filter((trophyChange) => trophyChange != undefined)
      if (trophyChanges.length == 0) {
        return 0
      }
      return trophyChanges.reduce((sum, t) => sum + t, 0) / trophyChanges.length
    },
    winRate(): number {
      if (this.battleTotals != undefined && this.battleTotals.battle_victory != undefined) {
        return this.battleTotals.battle_victory
      }
      if (this.player.battles.length == 0) {
        return 0
      }
      return this.player.battles.filter((battle) => battle.victory).length / this.player.battles.length
    },
    totalBattles(): number {
      return this.battleTotals.picks || this.player.battles.length
    },
    accountRating(): string {
      const medTrophies = this.trophiesGoal / this.totalBrawlers
      // measured on 2020-11-01 with data from 2020-10-01
      // select quantile(0.25)(player_trophies/player_brawlers_length), quantile(0.375)(player_trophies/player_brawlers_length), quantile(0.5)(player_trophies/player_brawlers_length), quantile(0.90)(player_trophies/player_brawlers_length), quantile(0.95)(player_trophies/player_brawlers_length), quantile(0.99)(player_trophies/player_brawlers_length) from battle where trophy_season_end>=now()-interval 28 day and timestamp>now()-interval 28 day and timestamp<now()-interval 27 day and battle_event_powerplay=0
      for (const key in this.ratingPercentiles) {
        if (medTrophies <= this.ratingPercentiles[key][1]) {
          return key
        }
      }
      return '?'
    },
    funStats(): { [name: string]: { label: string, value: (n: number) => number } } {
      return {
        recharges: {
          // measured with AccuBattery on my phone
          label: 'empty batteries',
          value: (h) => h / 4.27
        },
        toiletBreaks: {
          // https://www.unilad.co.uk/featured/this-is-how-much-of-your-life-youve-spent-on-the-toilet/
          // 102 minutes over 7 days = 1/4 h/day, assuming 1 session/day
          label: 'toilet breaks',
          value: (h) => h / (102 / 7 / 60)
        },
        books: {
          // https://io9.gizmodo.com/how-long-will-it-take-to-read-that-book-this-chart-giv-1637170555
          label: 'books unread',
          value: (h) => h / 7.72
        },
        songs: {
          // https://www.statcrunch.com/5.0/viewreport.php?reportid=28647&groupid=948
          label: 'songs unheard',
          value: (h) => h / (3.7 / 60)
        },
      }
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers as number,
    })
  },
})
</script>

<style lang="postcss" scoped>
.bigstat-wrapper {
  @apply flex flex-wrap mx-auto md:justify-center md:mx-0;
}

.bigstat-container {
  @apply flex flex-wrap justify-center items-center mt-2 w-full;
}

@screen xl {
  .bigstat-container {
    @apply mx-6 w-auto;
  }
}

.bigstat-left {
  @apply w-1/2 text-right flex justify-end items-center pr-2;
}

.bigstat-right {
  @apply w-1/2 text-left flex justify-start items-center pl-2;
}

.bigstat-label {
  @apply leading-none text-white;
}

.bigstat-number {
  @apply text-5xl font-bold text-yellow-400;
}

.bigstat-tooltip__btn {
  @apply absolute mt-0 mr-1 text-red-500 font-semibold underline top-0 right-0;
}

.text-5vw {
  font-size: 5vw;
}

@responsive {
  .text-4xl\! {
    @apply text-4xl;
  }
}
</style>
