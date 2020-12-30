<template>
  <div class="md:flex md:flex-wrap md:justify-center">
    <div class="w-full mb-2">
      <p>{{ description }}</p>
    </div>

    <card
      v-if="trophiesUseRateChart != undefined"
      size="w-full md:w-120"
    >
      <plotly
        slot="content"
        :traces="trophiesUseRateChart.traces"
        :layout="trophiesUseRateChart.layout"
        :options="trophiesUseRateChart.options"
        class="h-48"
      ></plotly>
    </card>

    <card
      v-if="trophiesWinRateChart != undefined"
      size="w-full md:w-120"
    >
      <plotly
        slot="content"
        :traces="trophiesWinRateChart.traces"
        :layout="trophiesWinRateChart.layout"
        :options="trophiesWinRateChart.options"
        class="h-48"
      ></plotly>
    </card>

    <card
      v-if="trophiesStarRateChart != undefined"
      size="w-full md:w-120"
    >
      <plotly
        slot="content"
        :traces="trophiesStarRateChart.traces"
        :layout="trophiesStarRateChart.layout"
        :options="trophiesStarRateChart.options"
        class="h-48"
      ></plotly>
    </card>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import { scaleInto } from '~/lib/util'
import { BrawlerStatisticsRows } from '~/model/Clicker'

interface Row {
  brawler_trophyrange: number
  picks: number
  picks_weighted: number
  battle_victory: number
  battle_starplayer: number
}

const trophyGraphLayout = {
  xaxis: {
    title: {
      text: 'Trophies',
      standoff: 10,
    },
    fixedrange: true,
    tickcolor: '#ffffff',
    automargin: true,
  },
  margin: { t: 0, l: 0, b: 0, r: 0 },
  showlegend: true,
  legend: {
    x: 0,
    y: 1,
    bgcolor: 'rgba(0, 0, 0, 0.5)',
    font: {
      size: 10,
    },
  },
}

const primaryScatterColors = {
  line: {
    color: '#facc15', // yellow-400
  },
  marker: {
    color: '#facc15',
  },
}

const trophyranges = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export default Vue.extend({
  props: {
    brawlerName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      data: [] as Row[],
      totals: [] as Row[],
    }
  },
  fetchDelay: 0,
  fetchOnServer: false,
  async fetch() {
    const brawlerData = await this.$clicker.query<Row>('meta.brawler.by-trophies-widget', 'map',
      ['brawler_trophyrange'],
      ['battle_victory', 'battle_starplayer', 'picks_weighted', 'picks'],
      {
        ...this.$clicker.defaultSlicesRaw('map'),
        // TODO use ID
        brawler_name: [this.brawlerName.toUpperCase()],
      },
      { sort: { picks: 'desc' }, cache: 60*60 })
    this.data = brawlerData.data

    const totalData = await this.$clicker.query<Row>('meta.brawler.by-trophies-widget', 'map',
      ['brawler_trophyrange'],
      ['battle_victory', 'battle_starplayer', 'picks_weighted', 'picks'],
      {
        ...this.$clicker.defaultSlicesRaw('map'),
      },
      { sort: { picks: 'desc' }, cache: 60*60 })
    this.totals = totalData.data
  },
  computed: {
    useRates(): number[] {
      if (this.data.length < trophyranges.length || this.totals.length < trophyranges.length) {
        return []
      }
      return trophyranges.map(t =>
        this.data.find(b => b.brawler_trophyrange == t)!.picks_weighted
        / this.totals.find(b => b.brawler_trophyrange == t)!.picks_weighted
      )
    },
    description(): string {
      if (this.useRates.length == 0) {
        return ''
      }

      const sum = (ns: number[]) => ns.reduce((sum, n) => sum + n, 0)
      const lowerSum = sum(this.useRates.slice(0, 4))
      const upperSum = sum(this.useRates.slice(6, 10))
      const slope = (upperSum - lowerSum) / (lowerSum + upperSum)
      const slopeWords = ['less popular than', 'about as popular as', 'more popular than']
      const slopeWord = slopeWords[scaleInto(-0.25, 0.25, slopeWords.length - 1, slope)]
      return `
        In high trophy battles, ${this.brawlerName} is ${slopeWord} than in low trophy battles.
      `
    },
    trophiesStarRateChart(): any {
      if (this.data.length < trophyranges.length || this.totals.length < trophyranges.length) {
        return undefined
      }

      const starRates = trophyranges.map(t =>
        this.data.find(b => b.brawler_trophyrange == t)!.battle_starplayer)
      const avgStarRates = trophyranges.map(t =>
        this.totals.find(b => b.brawler_trophyrange == t)!.battle_starplayer)

      return {
        traces: [{
          name: this.brawlerName,
          x: trophyranges.map(t => t * 100),
          y: starRates,
          mode: 'lines+markers',
          type: 'scatter',
          ...primaryScatterColors,
        }, {
          name: 'Average',
          x: trophyranges.map(t => t * 100),
          y: avgStarRates,
          mode: 'lines',
          type: 'scatter',
          line: {
            color: 'grey',
            dash: 'dot',
            width: 1,
          },
        }],
        layout: {
          ...trophyGraphLayout,
          yaxis: {
            title: {
              text: 'Star Rate',
              standoff: 10,
            },
            fixedrange: true,
            tickformat: ',.0%',
            tickcolor: '#ffffff',
            automargin: true,
          },
        },
      }
    },
    trophiesUseRateChart(): any {
      if (this.data.length < trophyranges.length || this.totals.length < trophyranges.length) {
        return undefined
      }

      return {
        traces: [{
          name: this.brawlerName,
          x: trophyranges.map(t => t * 100),
          y: this.useRates,
          mode: 'lines+markers',
          type: 'scatter',
          ...primaryScatterColors,
        }, {
          name: 'Average',
          x: trophyranges.map(t => t * 100),
          y: trophyranges.map(t => 1 / this.totalBrawlers),
          mode: 'lines',
          type: 'scatter',
          line: {
            color: 'grey',
            dash: 'dot',
            width: 1,
          },
        }],
        layout: {
          ...trophyGraphLayout,
          yaxis: {
            title: {
              text: 'Use Rate',
              standoff: 10,
            },
            fixedrange: true,
            tickformat: ',.0%',
            tickcolor: '#ffffff',
            automargin: true,
          },
        },
      }
    },
    trophiesWinRateChart(): any {
      if (this.data.length < trophyranges.length || this.totals.length < trophyranges.length) {
        return undefined
      }

      const winRates = trophyranges.map(t =>
        this.data.find(b => b.brawler_trophyrange == t)!.battle_victory)
      const avgWinRates = trophyranges.map(t =>
        this.totals.find(b => b.brawler_trophyrange == t)!.battle_victory)

      return {
        traces: [{
          name: this.brawlerName,
          x: trophyranges.map(t => t * 100),
          y: winRates,
          mode: 'lines+markers',
          type: 'scatter',
          ...primaryScatterColors,
        }, {
          name: 'Average',
          x: trophyranges.map(t => t * 100),
          y: avgWinRates,
          mode: 'lines',
          type: 'scatter',
          line: {
            color: 'grey',
            dash: 'dot',
            width: 1,
          },
        }],
        layout: {
          ...trophyGraphLayout,
          yaxis: {
            title: {
              text: 'Win Rate',
              standoff: 10,
            },
            fixedrange: true,
            tickformat: ',.0%',
            tickcolor: '#ffffff',
            automargin: true,
          },
        },
      }
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers as number,
    })
  }
})
</script>
