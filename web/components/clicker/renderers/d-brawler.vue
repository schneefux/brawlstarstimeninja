<template functional>
  <router-link
    :to="`/tier-list/brawler/${props.brawlerId({ name: props.row.dimensionsRaw.brawler.brawler_name })}`"
    class="flex items-center"
  >
    <div class="mr-2 w-10 sm:w-12 md:w-14">
      <media-img
        :path="`/brawlers/${props.brawlerId({ name: props.row.dimensionsRaw.brawler.brawler_name })}/avatar`"
        :alt="props.row.dimensions.brawler"
        size="160"
        clazz="h-6 sm:h-8 md:h-10"
      ></media-img>
    </div>
    <span
      v-if="props.captioned"
      class="w-16 md:w-24"
    >{{ props.row.dimensions.brawler }}</span>
  </router-link>
</template>

<script lang="ts">
import Vue from 'vue'
import { brawlerId } from '~/lib/util'

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
    brawlerId: {
      type: Function,
      default: brawlerId
    },
  },
})
</script>
