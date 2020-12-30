<template functional>
  <div class="flex items-center">
    <brawler-team
      :brawlers="props.row.dimensionsRaw.team.brawler_names"
      class="flex-shrink-0 md:mr-2 w-16 sm:w-20 md:w-24"
      height="h-6 sm:h-8 md:h-10"
      width="w-6 sm:w-8 md:w-10"
      snug="-ml-2 sm:-ml-3 md:-ml-4"
    ></brawler-team>
    <span class="text-xs sm:text-sm md:text-base tracking-tight leading-tight! w-28 md:w-36">{{ props.row.dimensions.team }}</span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  functional: true,
  props: {
    row: {
      type: Object,
      required: true
    },
  },
})
</script>
