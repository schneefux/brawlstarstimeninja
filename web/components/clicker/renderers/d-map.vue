<template functional>
  <router-link
    :to="`/tier-list/mode/${props.camelToKebab(props.row.dimensionsRaw.map.battle_event_mode)}/map/${props.row.dimensionRaw.map.battle_event_map}`"
    class="flex items-center"
  >
    <div class="mr-2 w-10 sm:w-12 md:w-14">
      <media-img
        :path="`/maps/${props.row.dimensionsRaw.map.battle_event_id}`"
        :alt="props.row.dimensions.map"
        size="160"
        clazz="h-6 sm:h-8 md:h-10"
      ></media-img>
    </div>
    <span
      v-if="props.captioned"
      class="w-16 md:w-24"
    >{{ props.row.dimensions.map }}</span>
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
