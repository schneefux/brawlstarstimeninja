<template>
  <plotly
    :traces="chart.traces"
    :layout="chart.layout"
    :options="chart.options"
    class="h-64"
  ></plotly>
</template>

<script lang="ts">
import Vue from 'vue'
import { formatMode } from '~/lib/util'

interface Row {
  battle_event_mode: string
  picks: number
}

export default Vue.extend({
  data() {
    return {
      battlesByMode: [] as Row[],
    }
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('stats.popularity', 'map',
      ['battle_event_mode'],
      ['picks'],
      this.$clicker.defaultSlicesRaw('map'),
      {
        sort: { picks: 'desc' },
        cache: 60*60,
      })
    this.battlesByMode = data.data as any
  },
  computed: {
    chart(): any {
      const entries = this.battlesByMode

      return {
        traces: [{
          labels: entries.map(e => formatMode(e.battle_event_mode)),
          values: entries.map(e => {
            // with every battle, allies are added to map meta as well,
            // so manually correct the totals
            return e.battle_event_mode == 'soloShowdown' ? e.picks
              : e.battle_event_mode == 'duoShowdown' ? e.picks / 2
              : e.picks / 3
          }),
          type: 'pie',
          textinfo: 'label+percent',
          textposition: 'inside',
          automargin: true,
        }],
        layout: {
          margin: { t: 0, l: 0, b: 0, r: 0 },
          showlegend: false,
        },
      }
    },
  },
})
</script>
