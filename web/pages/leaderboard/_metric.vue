<template>
  <page :title="'Brawl Stars ' + metricName + ' Leaderboard'">
    <p>The best Brawl Stars players world wide, ranked by {{ metricName }}.</p>

    <client-only>
      <adsense
        id="ezoic-pub-ad-placeholder-105"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="4579727583"
        data-ad-format="auto"
        data-full-width-responsive="yes"
        ins-class="mt-3"
      ></adsense>
    </client-only>

    <horizontal-scroller
      class="mt-3"
      expand-on-desktop
    >
      <b-button
        v-for="metric in metrics"
        :key="metric"
        :to="`/leaderboard/${metric}`"
        class="mt-2 mr-2 whitespace-nowrap"
        primary
        sm
      >
        {{ formatMetric(metric) }} Leaderboard
      </b-button>
    </horizontal-scroller>

    <div class="flex justify-center">
      <card :title="`Best Players by ${metricName}`">
        <template v-slot:content>
          <p class="mb-1">
            Top {{ leaderboard.length }} players on Brawl Time Ninja, updated hourly
          </p>
          <div class="mt-2">
            <player-rank-table
              :columns="[metric]"
              :column-names="[metricName]"
              :rows="rows"
            ></player-rank-table>
          </div>
        </template>
      </card>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        id="ezoic-pub-ad-placeholder-106"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="5140154307"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { MetaInfo } from 'vue-meta'
import { mapState, mapActions } from 'vuex'
import { Leaderboard, LeaderboardEntry } from '@/model/Api'
import { camelToSnakeCase, capitalizeWords } from '@/lib/util'
import { PlayerRankTableRow } from '~/components/player-rank-table.vue'

function formatMetric(m: string) {
  return capitalizeWords(camelToSnakeCase(m).replace(/_/g, ' '))
}

export default Vue.extend({
  head(): MetaInfo {
    const description = `Brawl Stars ${this.metricName} Leaderboard. Players ranked by most ${this.metricName}.`
    return {
      title: `Brawl Stars ${this.metricName} Leaderboard`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  middleware: ['cached'],
  data() {
    return {
      formatMetric,
      metric: '',
      metricName: '',
      metrics: [
        'hours',
        'trophies',
        'powerPlayPoints',
        'victories',
        'soloVictories',
        'duoVictories',
      ],
      leaderboard: [] as LeaderboardEntry[],
    }
  },
  async asyncData({ $axios, params }) {
    const metric = params.metric as string
    const leaderboard = await $axios.$get<Leaderboard>(`/api/leaderboard/${metric}`)

    return {
      metric,
      metricName: formatMetric(metric),
      leaderboard: leaderboard.entries,
    }
  },
  computed: {
    rows(): PlayerRankTableRow[] {
      return this.leaderboard.map(e => ({
        player_name: e.name,
        player_tag: e.tag,
        player_icon_id: e.icon,
        [this.metric]: Math.floor(e.metric),
      }))
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
})
</script>

<style scoped lang="postcss">
.table th {
  @apply py-2 px-2;
}

.table td {
  @apply py-4 px-2;
}

.table tbody td, tbody th {
  @apply border-t border-gray-200;
}
</style>
