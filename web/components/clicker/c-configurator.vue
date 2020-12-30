<template>
  <card v-bind="$attrs">
    <div
      slot="content"
      class="flex flex-wrap"
    >
      <h1 class="text-xl font-semibold hidden md:inline my-1 mr-4">
        Data Source
      </h1>

      <div class="mr-2 my-1">
        <b-select
          :value="value.cubeId"
          dark
          sm
          @input="v => onInputCubeId(v)"
        >
          <option
            v-for="c in config"
            :key="c.id"
            :value="c.id"
          >
            {{ c.name }}
          </option>
        </b-select>
      </div>

      <div class="mr-2 my-1">
        <b-select
          :value="value.measurementsIds.length == 1 ? value.measurementsIds[0] : ''"
          dark
          sm
          @input="v => onInputMeasurementsIds([v])"
        >
          <option value="">All</option>
          <option
            v-for="m in config[value.cubeId].measurements"
            :key="m.id"
            :value="m.id"
          >
            {{ m.name }}
          </option>
        </b-select>
      </div>

      <div class="mr-2 my-1">
        <b-select
          :value="value.dimensionsIds[0]"
          dark
          sm
          @input="v => onInputDimensionsIds([v])"
        >
          <option
            v-for="d in config[value.cubeId].dimensions"
            :key="d.id"
            :value="d.id"
          >
            {{ d.name }}
          </option>
        </b-select>
      </div>
    </div>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Config, SliceValue } from '~/lib/cube'

export interface Configuration {
  cubeId: string
  slices: SliceValue
  dimensionsIds: string[]
  measurementsIds: string[]
}

export default Vue.extend({
  inheritAttrs: false,
  props: {
    value: {
      type: Object as PropType<Configuration>,
      required: true
    },
    config: {
      type: Object as PropType<Config>,
      required: true
    },
  },
  methods: {
    onInputCubeId(c: string) {
      this.$emit('input', <Configuration>{
        cubeId: c,
        slices: this.$clicker.defaultSlices(c),
        dimensionsIds: [this.config[c].defaultDimensionId],
        measurementsIds: [this.config[c].defaultMeasurementId],
      })
    },
    onInputDimensionsIds(d: string[]) {
      this.$emit('input', <Configuration>{
        ...this.value,
        dimensionsIds: d,
      })
    },
    onInputMeasurementsIds(m: string[]) {
      if (m[0] == '') {
        m = this.config[this.value.cubeId].measurements.map(m => m.id)
      }
      this.$emit('input', <Configuration>{
        ...this.value,
        measurementsIds: m,
      })
    },
  },
})
</script>
