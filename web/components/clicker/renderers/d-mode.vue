<template functional>
  <router-link
    :to="`/tier-list/mode/${props.camelToKebab(props.row.dimensionsRaw.mode.battle_event_mode)}`"
    class="flex items-center"
  >
    <div class="mr-2 w-24 sm:w-23 md:w-40">
      <media-img
        :path="`/modes/${props.row.dimensionsRaw.mode.battle_event_mode}/background`"
        :alt="props.row.dimensions.mode"
        size="160"
        clazz="h-6 sm:h-8 md:h-10"
      ></media-img>
    </div>
    <span
      v-if="props.captioned"
      class="w-16 md:w-24"
    >{{ props.row.dimensions.mode }}</span>
  </router-link>
</template>

<script lang="ts">
import Vue from 'vue'
import { camelToKebab } from '~/lib/util'

export default Vue.extend({
  functional: true,
  props: {
    row: {
      type: Object,
      required: true
    },
    captioned: {
      type: Boolean
    },
    camelToKebab: {
      type: Function,
      default: camelToKebab
    },
  },
})
</script>
