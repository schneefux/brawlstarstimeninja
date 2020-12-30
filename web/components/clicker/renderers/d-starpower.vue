<template functional>
  <router-link
    :to="`/tier-list/brawler/${props.brawlerId({ name: props.row.dimensionsRaw.starpower.brawler_name })}`"
    :title="props.row.dimensions.starpower"
    class="flex items-center"
  >
    <div class="mr-2 w-10 sm:w-12 md:w-14 relative">
      <media-img
        :path="`/brawlers/${props.brawlerId({ name: props.row.dimensionsRaw.starpower.brawler_name })}/avatar`"
        :alt="props.capitalizeWords(props.row.dimensionsRaw.starpower.brawler_name.toLowerCase())"
        size="160"
        clazz="h-6 sm:h-8 md:h-10"
      ></media-img>
      <media-img
        :path="`/starpowers/${props.row.dimensionsRaw.starpower.brawler_starpower_id}`"
        :alt="props.row.dimensions.starpower"
        size="80"
        clazz="w-6 sm:w-8 absolute top-0 right-0 bg-gray-900 bg-opacity-75 rounded-full p-1"
      ></media-img>
    </div>
    <span
      v-if="props.captioned"
      class="w-16 md:w-24"
    >{{ props.row.dimensions.starpower }}</span>
  </router-link>
</template>

<script lang="ts">
import Vue from 'vue'
import { brawlerId, capitalizeWords } from '~/lib/util'

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
    capitalizeWords: {
      type: Function,
      default: capitalizeWords
    },
  },
})
</script>
