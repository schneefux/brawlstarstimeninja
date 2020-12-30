<template>
  <div>
    <slot
      v-if="state != undefined"
      :loading="loading"
      :data="state.data"
      :dimensions="state.dimensions"
      :measurements="state.measurements"
      v-bind="$attrs"
    ></slot>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { MetaGridEntry } from '@/lib/util'
import { Config, Dimension, Measurement, Slice, SliceValue } from '~/lib/cube'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    config: {
      type: Object as PropType<Config>,
      required: true
    },
    cubeId: {
      type: String,
      required: true
    },
    dimensionsIds: {
      type: Array as PropType<string[]>,
      required: true
    },
    measurementsIds: {
      type: Array as PropType<string[]>,
      required: true
    },
    slicesValues: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
    sortId: {
      type: String,
      required: true
    },
    limit: {
      type: Number
    },
  },
  data() {
    return {
      loading: false,
      state: undefined as any,
    }
  },
  watch: {
    config: '$fetch',
    cubeId: '$fetch',
    dimensionsIds: '$fetch',
    measurementsIds: '$fetch',
    slicesValues: '$fetch',
    sortId: '$fetch',
  },
  fetchOnServer: false, // FIXME causes v-table render error :(
  fetchDelay: 0,
  async fetch() {
    this.loading = true

    if (!(this.cubeId in this.config)) {
      console.error('Invalid cubeId ' + this.cubeId)
      return
    }

    const sort = this.config[this.cubeId].measurements
      .find(m => this.sortId == m.id)
    const dimensions = this.config[this.cubeId].dimensions
      .filter(d => this.dimensionsIds.includes(d.id))
    const measurements = this.config[this.cubeId].measurements
      .filter(m => this.measurementsIds.includes(m.id))

    const query = this.$clicker.constructQuery(dimensions, measurements, this.config[this.cubeId].slices, {
      ...this.$clicker.defaultSlices(this.cubeId),
      ...this.slicesValues,
    })
    const rawData = await this.$clicker.query('meta.' + this.cubeId, this.cubeId,
      query.dimensions,
      query.measurements,
      query.slices, {
        ...(sort != undefined ? {
          sort: { [sort.column]: 'desc' },
        } : {}),
        cache: 60*30,
        limit: this.limit,
      })

    const data = this.$clicker.mapToMetaGridEntry(dimensions, measurements, rawData.data, rawData.totals)

    this.state = {
      data,
      dimensions,
      measurements,
    }
    this.loading = false
  },
})
</script>
