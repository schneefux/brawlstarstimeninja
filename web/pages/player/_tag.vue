<template>
  <page>
    <client-only>
      <adsense
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="9429125351"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
      <div style="height: 300px;" class="adswrapper ad-section w-full" slot="placeholder"></div>
    </client-only>

    <div
      class="mt-4 relative"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'hours'),
        once: true,
      }"
    >
      <media-img
        :path="`/avatars/${player.icon.id}`"
        clazz="absolute w-16 md:w-24 lg:w-32 xl:w-40 right-0 z-0"
      ></media-img>
      <h1 class="text-4xl font-semibold relative z-10">
        Statistics for
        <span class="text-yellow-400">{{ player.name }}</span>
        <span
          v-if="player.tag == 'V8LLPPC'"
          class="align-top text-xs text-yellow-400 border-2 border-yellow-400 rounded-lg px-1 font-black"
        >DEV</span>
      </h1>
    </div>

    <player-hype-stats
      :player="player"
      :hours-leaderboard="hoursLeaderboard"
      :enable-clicker-stats="enableClickerStats"
      :battle-totals="battleTotals"
      class="leading-tight text-center mt-6"
    ></player-hype-stats>

    <player-quiz
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'quiz'),
        once: true,
      }"
      :player="player"
      class="mt-2 mx-auto"
    ></player-quiz>

    <client-only>
      <adsense
        v-if="!isApp"
        data-ad-format="auto"
        data-full-width-responsive="no"
        ins-class="w-screen -mx-4 md:w-full ad-section mb-4"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="3933066188"
      />
    </client-only>

    <player-teaser-card
      v-slot="props"
      title="Personal Records"
      description="Compare your profile statistics against pro players."
    >
      <player-lifetime
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'lifetime'),
          once: true,
        }"
        :player="player"
        :tease="!props.open"
      ></player-lifetime>

      <player-percentiles
        v-show="props.open"
        :player="player"
      ></player-percentiles>
    </player-teaser-card>

    <div class="my-1 md:my-4 mx-1 md:ml-4 flex items-center">
      <h2 class="text-2xl font-semibold">
        Info!
      </h2>
      <p class="text-xs ml-3">
        Play times are estimated and statistics are compared against other visitors.
        They are not official numbers.
        Win Rates are based on your last {{ totalBattles }} battles.
        <br />
        Check your profile daily to get the most accurate statistics.
      </p>
    </div>

    <player-teaser-card
      v-if="player.battles.length > 0"
      v-slot="props"
      :pages="Math.ceil(player.battles.length / 6)"
      title="Battle Log"
      description="See your latest battles and calculate your Win Rate."
    >
      <player-battles-squares
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'battles'),
          once: true,
        }"
        :battles="player.battles"
        :tease="!props.open"
      ></player-battles-squares>

      <div
        v-show="props.open"
        class="w-full md:w-auto md:ml-auto mt-2 flex items-center"
      >
        <span class="text-sm text-grey-lighter">
          Updating again in {{ Math.floor(refreshSecondsLeft / 60) }}m {{ refreshSecondsLeft % 60 }}s
        </span>
        <b-button
          class="ml-auto md:ml-4"
          sm
          primary
          @click="refresh"
        >
          Refresh now
        </b-button>
      </div>

      <player-battles-stats
        v-show="props.open"
        :battle-totals="battleTotals"
        :battles="player.battles"
      ></player-battles-stats>

      <player-battles
        v-show="props.open"
        :player="player"
        :limit="props.page * 6"
      ></player-battles>
    </player-teaser-card>

    <install-card
      class="mx-auto"
    ></install-card>

    <client-only>
      <adsense
        v-if="!isApp && player.battles.length > 0"
        data-ad-format="auto"
        data-full-width-responsive="no"
        ins-class="w-screen -mx-4 md:w-full ad-section mb-4"
        id="ezoic-pub-ad-placeholder-102"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="4129048243"
      />
    </client-only>

    <player-teaser-card
      v-slot="props"
      title="Game Modes"
      description="View your win rate in different modes and get personalized recommendations."
    >
      <player-mode-winrates
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'gamemodes'),
          once: true,
        }"
        :player="player"
        :battles="player.battles"
        :active-map-meta="activeMapMeta"
        :tease="!props.open"
        :enable-clicker-stats="enableClickerStats"
      ></player-mode-winrates>

      <div
        v-show="props.open"
        class="mt-2 w-full flex justify-end"
      >
        <player-tips
          :player="player"
          :active-map-meta="activeMapMeta"
          class="mr-3"
        ></player-tips>

        <b-button
          to="/tier-list/map"
          md
          primary
          prefetch
        >
          Open Map Tier List
        </b-button>
      </div>
    </player-teaser-card>

    <client-only>
      <adsense
        v-if="!isApp"
        data-ad-format="auto"
        data-full-width-responsive="no"
        ins-class="w-screen -mx-4 md:w-full ad-section mb-4"
        id="ezoic-pub-ad-placeholder-101"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="1752268168"
      />
    </client-only>

    <player-teaser-card
      v-slot="props"
      :pages="Math.ceil(Object.keys(player.brawlers).length) / 15"
      title="Brawlers"
      description="View Trophy Graphs and Win Rates for all of your Brawlers."
    >
      <player-brawlers
        :player="player"
        :tease="!props.open"
        :limit="props.page * 15"
        :enable-clicker-stats="enableClickerStats"
      ></player-brawlers>
    </player-teaser-card>

    <page-section
      v-if="relevantGuides.length > 0"
      title="Guides from the Blog"
      tracking-id="articles"
      tracking-page-id="profile"
    >
      <blogroll
        :posts="relevantGuides"
        topic="guides"
      ></blogroll>
    </page-section>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { MetaInfo } from 'vue-meta'
import { mapState, mapActions } from 'vuex'
import { MapMetaMap } from '../../model/MetaEntry'
import { Post } from '../../model/Web'
import { Leaderboard, LeaderboardEntry } from '@/model/Api'
import { BattleTotalRow } from '@/components/player-battles-stats.vue'

export default Vue.extend({
  head(): MetaInfo {
    const description = `Brawl Time for ${this.player.name}: ${Math.floor(this.player.hoursSpent)} hours spent, ${this.player.trophies} Trophies. Track Brawl Stars stats, calculate your Win Rate and get Tips.`
    return {
      title: this.player.name,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  middleware: ['cached'],
  data() {
    return {
      refreshSecondsLeft: 180,
      activeMapMeta: {} as MapMetaMap,
      guides: [] as Post[],
      hoursLeaderboard: [] as LeaderboardEntry[],
      battleTotals: {} as BattleTotalRow,
    }
  },
  computed: {
    relevantGuides(): Post[] {
      return this.guides.slice(0, 3)
    },
    totalBattles(): number {
      return this.battleTotals.picks || this.player.battles.length
    },
    enableClickerStats(): boolean {
      // do not send queries to backend if user has no battle history in database
      return this.battleTotals.picks != undefined && this.battleTotals.picks > 25
    },
    topBrawlerId(): string {
      const brawlerIds = [...Object.keys(this.player.brawlers)]
      return brawlerIds[0]
    },
    ...mapState({
      player: (state: any) => state.player,
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  async validate({ store, params }) {
    const { tag } = params
    const tagRegex = RegExp(store.state.tagPattern)

    if (!tagRegex.test(tag)) {
      return false
    }

    let lastError
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await store.dispatch('loadPlayer', tag)
        return true
      } catch (error) {
        if (error.response !== undefined && error.response.status === 404) {
          return false
        }
        lastError = error
      }
    }

    throw lastError
  },
  mounted() {
    setTimeout(() => this.refreshTimer(), 15 * 1000)
  },
  async asyncData(context) {
    const $axios = context.$axios
    const $content = (<any>context).$content

    const [guides, activeMapMeta, hoursLeaderboard] = await Promise.all([
      $content('guides').sortBy('createdAt', 'desc').fetch(),
      $axios.$get<MapMetaMap>('/api/meta/map/events').catch(() => ({})),
      $axios.$get<Leaderboard>('/api/leaderboard/hours').catch(() => ({ metric: 'hours', entries: [] })),
    ])

    return {
      guides: guides as Post[],
      hoursLeaderboard: (<Leaderboard>hoursLeaderboard).entries as LeaderboardEntry[],
      activeMapMeta,
    }
  },
  fetchDelay: 0,
  async fetch() {
    const battleData = await this.$clicker.query('player.winrates.total',
      'battle',
      [],
      ['picks', 'battle_victory', 'battle_trophy_change'],
      {
        ...this.$clicker.defaultSlicesRaw('battle'),
        player_tag: [this.player.tag],
      },
      { sort: { picks: 'desc' }, cache: 60 })

    if (battleData.data[0].picks != undefined) {
      this.battleTotals = battleData.data[0]
    }
  },
  methods: {
    async refreshTimer() {
      this.refreshSecondsLeft -= 15
      if (this.refreshSecondsLeft <= 0) {
        await this.refresh()
        await this.$fetch()
      }
      setTimeout(() => this.refreshTimer(), 15 * 1000)
    },
    async refresh() {
      this.refreshSecondsLeft = 180
      await this.refreshPlayer()
    },
    trackScroll(visible, entry, section) {
      if (visible) {
        this.$gtag.event('scroll', {
          'event_category': 'profile',
          'event_label': section,
        })
      }
    },
    ...mapActions({
      refreshPlayer: 'refreshPlayer',
    }),
  },
})
</script>
