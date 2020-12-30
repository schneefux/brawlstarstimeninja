<template>
  <div
    class="mr-2 my-1"
  >
    <b-select
      :value="(value.powerplay || [])[0]"
      dark
      sm
      @input="v => $parent.$emit('input', { ...value, powerplay: [v] })"
    >
      <option value="false">Regular Battles</option>
      <option value="true">Power Play</option>
    </b-select>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { SliceValue } from '~/lib/cube'

export default Vue.extend({
  props: {
    value: {
      type: Object as PropType<SliceValue>,
      required: true
    },
  },
})
</script>
