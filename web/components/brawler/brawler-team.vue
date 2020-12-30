<template functional>
  <div
    :style="data.staticStyle"
    :class="['flex flex-row-reverse justify-center', data.class, data.staticClass]"
  >
    <router-link
      v-for="(brawler, index) in props.brawlers"
      :key="brawler + '-' + index"
      :to="`/tier-list/brawler/${props.brawlerId({ name: brawler })}`"
      :class="[props.height, props.width, {
        [props.snug]: index < props.brawlers.length - 1,
      }]"
    >
      <media-img
        :path="`/brawlers/${props.brawlerId({ name: brawler})}/avatar`"
        :alt="props.capitalizeWords(brawler.toLowerCase())"
        size="160"
        :clazz="'bg-gray-800 border-transparent border-2 rounded-full object-cover ' + props.height + ' ' + props.width"
      ></media-img>
    </router-link>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { brawlerId, capitalizeWords } from '~/lib/util'

export default Vue.extend({
  functional: true,
  props: {
    brawlers: {
      type: Array as PropType<string[]>,
      required: true
    },
    brawlerId: {
      type: Function,
      default: brawlerId
    },
    capitalizeWords: {
      type: Function,
      default: capitalizeWords
    },
    xs: {
      type: Boolean
    },
    height: {
      type: String,
      default: 'h-8'
    },
    width: {
      type: String,
      default: 'w-8'
    },
    snug: {
      type: String,
      default: '-ml-4'
    },
  },
})
</script>
