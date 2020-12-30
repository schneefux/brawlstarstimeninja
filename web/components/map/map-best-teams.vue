<template>
  <shimmer
    :loading="$fetchState.pending"
    class="mx-auto flex justify-between h-12 w-72"
  >
    <div
      v-for="team in teams.slice(0, limit)"
      :key="team.id"
      class="flex-1 flex flex-col justify-end mx-px"
    >
      <brawler-team
        :brawlers="team.brawlers"
        class="h-full"
      ></brawler-team>
      <p class="mt-1 self-center text-xs">
        {{ commonMeasurements.wins.formatter(team.wins) }}
        {{ commonMeasurements.wins.nameShort }}
      </p>
    </div>
    <p v-if="!$fetchState.pending && teams.length == 0">
      No data.
    </p>
  </shimmer>
</template>

<script lang="ts">
import { mapState } from 'vuex'
import Vue, { PropType } from 'vue'
import { MetaInfo } from 'vue-meta'
import { commonMeasurements } from '~/lib/cube'

interface Team {
  id: string
  brawlers: string[]
  wins: number
  winRate: number
}

export default Vue.extend({
  props: {
    map: {
      type: String,
    },
    mode: {
      type: String,
    },
    season: {
      type: String,
    },
    limit: {
      type: Number,
      default: 3,
    },
  },
  data() {
    return {
      teams: [] as Team[],
    }
  },
  watch: {
    map: '$fetch',
    mode: '$fetch',
    season: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const slices = {
      ...this.$clicker.defaultSlicesRaw('team'),
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
    }
    this.teams = []

    const data = await this.$clicker.query('meta.map.best-teams', 'team', ['brawler_names'], ['picks', 'wins', 'battle_victory'], slices, {
      cache: 60*15,
      sort: { wins: 'desc' },
      limit: this.limit,
    })
    this.teams = data.data.map((t) => (<Team>{
      id: t.brawler_names.join('+'),
      brawlers: t.brawler_names,
      wins: Math.floor(t.wins),
      winRate: t.wins / t.picks,
    }))
  },
  computed: {
    commonMeasurements() {
      return commonMeasurements
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers,
    })
  },
})
</script>
