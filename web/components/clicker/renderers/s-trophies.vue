<template>
  <trophy-slider-select
    :value="value.trophies || [0, 10]"
    class="mr-2 my-1"
    @input="v => $parent.$emit('input', { ...value, trophies: v })"
  ></trophy-slider-select>
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
