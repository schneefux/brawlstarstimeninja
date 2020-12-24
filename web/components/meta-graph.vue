<template>
  <card v-bind="$attrs">
    <plotly
      slot="content"
      v-if="chart != undefined"
      :traces="chart.traces"
      :layout="chart.layout"
      :options="chart.options"
      class="h-full"
    ></plotly>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { metaStatMaps, MetaGridEntry, getDotProp } from '../lib/util'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    cube: {
      type: String,
      required: true
    },
    dimension: {
      type: String,
      required: true
    },
    measurement: {
      type: String,
      required: true
    },
    entries: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true,
    },
  },
  computed: {
    chart(): any {
      if (this.entries.length == 0) {
        return undefined
      }

      const title = ['map', 'synergy'].includes(this.cube) ? 'Brawler' :
        this.cube == 'starpower' ? 'Star Power' :
        this.cube == 'gadget' ? 'Gadget' :
        this.cube == 'team' ? 'Team' : ''

      return {
        traces: [{
          x: this.entries.map(e => getDotProp(e.dimensions, this.dimension)),
          y: this.entries.map(e => getDotProp(e.measurements, this.measurement)),
          text: this.entries.map(e => getDotProp(e.dimensions, this.dimension)),
          marker: {
            color: '#facc15' // yellow-400
          },
          type: 'bar',
        }],
        layout: {
          margin: { t: 0, l: 0, b: 0, r: 0 },
          showlegend: false,
          xaxis: {
            title: {
              text: title,
              standoff: 10,
            },
            fixedrange: true,
            tickcolor: '#ffffff',
            automargin: true,
          },
          yaxis: {
            title: {
              text: this.measurementLabel,
              standoff: 10,
            },
            fixedrange: true,
            tickformat: metaStatMaps.d3formatters[this.measurement.replace('measurements.', '')], // FIXME
            tickcolor: '#ffffff',
            automargin: true,
          },
        },
      }
    },
  },
})
</script>
