<template>
  <div class="mr-2 my-1">
    <b-select
      :value="value.ally"
      dark
      sm
      @input="v => $emit('input', { ally: v })"
    >
      <option
        v-for="b in brawlers"
        :key="b"
        :value="b"
      >with {{ capitalize(b.toLowerCase()) }}</option>
    </b-select>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { SliceValue } from '~/lib/cube'
import { capitalize } from '~/lib/util'

export default Vue.extend({
  props: {
    value: {
      type: Object as PropType<SliceValue>,
      required: true
    },
  },
  data() {
    return {
      brawlers: [] as string[],
    }
  },
  async fetch() {
    const brawlers = await this.$clicker.queryAllBrawlers()
    this.brawlers = brawlers
      .sort((b1, b2) => b1.localeCompare(b2))
  },
  computed: {
    capitalize() {
      return capitalize
    },
  },
})
</script>
