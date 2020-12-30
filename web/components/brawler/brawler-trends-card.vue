<template>
  <div class="md:flex md:flex-wrap md:justify-center">
    <card
      v-if="useRateTrendGraph != undefined"
      size="w-full md:w-120"
    >
      <plotly
        slot="content"
        :traces="useRateTrendGraph.traces"
        :layout="useRateTrendGraph.layout"
        :options="useRateTrendGraph.options"
        class="h-48"
      ></plotly>
    </card>

    <card
      v-if="winRateTrendGraph != undefined"
      size="w-full md:w-120"
    >
      <plotly
        slot="content"
        :traces="winRateTrendGraph.traces"
        :layout="winRateTrendGraph.layout"
        :options="winRateTrendGraph.options"
        class="h-48"
      ></plotly>
    </card>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

interface Row {
  timestamp_day: string
  picks_weighted: number
  wins: number
  picks: number
}

const trendGraphLayout = {
  xaxis: {
    title: {
      text: 'Date',
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

const secondaryScatterColors = {
  line: {
    color: '#dc2626', // red-600
  },
  marker: {
    color: '#dc2626',
  },
}

function exponentialSmoothing(prop: keyof Row, rows: Row[], alpha: number) {
  return rows.slice(1)
    .reduce((v, r: Row, index) => [...v, (1 - alpha) * (index == 0 ? rows[0][prop] as number : v[index - 1]) + alpha * (r[prop] as number)], [] as number[])
}

function movingAverage(prop: keyof Row, rows: Row[], window: number) {
  return rows.slice(window - 1)
    .map((r, index) => rows
      .slice(index, index + window)
      .reduce((sum, r) => sum + (r[prop] as number), 0) / window
    )
}

export default Vue.extend({
  props: {
    brawler: {
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
    const brawlerData = await this.$clicker.query<Row>('brawler.trend', 'battle',
      ['timestamp_day'],
      ['wins', 'picks', 'picks_weighted'],
      {
        ...this.$clicker.defaultSlicesRaw('battle'),
        // TODO use ID
        brawler_name: [this.brawler.toUpperCase()],
      },
      { sort: { timestamp_day: 'asc' }, cache: 60*60 })
    this.data = brawlerData.data.filter(r => r.picks > 100)

    const totalData = await this.$clicker.query<Row>('brawler.trend', 'battle',
      ['timestamp_day'],
      ['picks_weighted'],
      {
        ...this.$clicker.defaultSlicesRaw('battle'),
      },
      { sort: { timestamp_day: 'asc' }, cache: 60*60 })
    this.totals = totalData.data
  },
  computed: {
    useRateTrendGraph(): any {
      if (this.data.length == 0 || this.totals.length == 0) {
        return undefined
      }

      const xs1d = this.data
        .map(r => r.timestamp_day)

      const xs7d = this.data
        .slice(4) // ~7/2
        .map(r => r.timestamp_day)

      const picks1d = this.data.map(r => r.picks_weighted)
      const picksTotal1d = this.totals.map(r => r.picks_weighted)
      const ys1d = xs1d.map((_, index) => picks1d[index] / picksTotal1d[index])

      const picks7d = movingAverage('picks_weighted', this.data, 7)
      const picksTotal7d = movingAverage('picks_weighted', this.totals, 7)
      const ys7d = xs7d.map((_, index) => picks7d[index] / picksTotal7d[index])

      return {
        traces: [{
          name: 'daily',
          x: xs1d,
          y: ys1d,
          mode: 'lines+markers',
          type: 'scatter',
          ...primaryScatterColors,
        }, {
          name: '7d average',
          x: xs7d,
          y: ys7d,
          mode: 'lines',
          type: 'scatter',
          ...secondaryScatterColors,
        }],
        layout: {
          ...trendGraphLayout,
          yaxis: {
            title: {
              text: 'Use Rate',
              standoff: 10,
            },
            fixedrange: true,
            tickformat: '.2%',
            tickcolor: '#ffffff',
            automargin: true,
          },
        },
      }
    },
    winRateTrendGraph(): any {
      if (this.data.length == 0 || this.totals.length == 0) {
        return undefined
      }

      const xs1d = this.data
        .map(r => r.timestamp_day)

      const xs7d = this.data
        .slice(4) // ~7/2
        .map(r => r.timestamp_day)

      const wins1d = this.data.map(r => r.wins)
      const picks1d = this.data.map(r => r.picks)
      const ys1d = xs1d.map((_, index) => wins1d[index] / picks1d[index])

      const wins7d = movingAverage('wins', this.data, 7)
      const picks7d = movingAverage('picks', this.data, 7)
      const ys7d = xs7d.map((_, index) => wins7d[index] / picks7d[index])


      return {
        traces: [{
          name: 'daily',
          x: xs1d,
          y: ys1d,
          mode: 'lines+markers',
          type: 'scatter',
          ...primaryScatterColors,
        }, {
          name: '7d average',
          x: xs7d,
          y: ys7d,
          mode: 'lines',
          type: 'scatter',
          ...secondaryScatterColors,
        }],
        layout: {
          ...trendGraphLayout,
          yaxis: {
            title: {
              text: 'Win Rate',
              standoff: 10,
            },
            fixedrange: true,
            tickformat: '.1%',
            tickcolor: '#ffffff',
            automargin: true,
          },
        },
      }
    },
  },
})
</script>
