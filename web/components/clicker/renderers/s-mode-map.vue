<template>
  <div class="mr-2 my-1">
    <b-select
      v-model="mode"
      dark
      sm
    >
      <option value="">All Modes</option>
      <option
        v-for="mode in modes"
        :key="mode"
        :value="mode"
      >{{ formatMode(mode) }}</option>
    </b-select>

    <b-select
      v-show="mode != ''"
      v-model="map"
      dark
      sm
    >
      <option value="">All Maps</option>
      <option
        v-for="map in maps"
        :key="map"
        :value="map"
      >{{ map }}</option>
    </b-select>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { SliceValue } from '~/lib/cube'
import { formatMode } from '~/lib/util'

export default Vue.extend({
  props: {
    value: {
      type: Object as PropType<SliceValue>,
      required: true
    },
  },
  data() {
    return {
      maps: [] as string[],
      modes: [] as string[],
    }
  },
  watch: {
    mode: '$fetch',
  },
  async fetch() {
    this.modes = await this.$clicker.queryAllModes()
    const maps = await this.$clicker.queryAllMaps(this.mode == '' ? undefined : this.mode)
    this.maps = maps.sort((m1, m2) => m1.localeCompare(m2))
  },
  computed: {
    mode: {
      get(): string {
        return (this.value.mode || {})[0]
      },
      set(v: string) {
        this.$parent.$emit('input', {
          ...this.value,
          mode: [v],
          map: [],
        })
      },
    },
    map: {
      get(): string {
        return (this.value.map || {})[0]
      },
      set(v: string) {
        this.$parent.$emit('input', {
          ...this.value,
          map: [v],
        })
      },
    },
    formatMode() {
      return formatMode
    },
  },
})
</script>
