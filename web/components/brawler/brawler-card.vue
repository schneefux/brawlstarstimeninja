<template functional>
  <card
    :title="props.title"
    :title-link="props.brawlerId != undefined ? `/tier-list/brawler/${props.brawlerId}` : undefined"
    sm
    v-bind="data.attrs"
    :style="data.staticStyle"
    :class="[data.class, data.staticClass]"
  >
    <template v-slot:preview>
      <slot name="preview"></slot>
    </template>
    <template v-slot:content>
      <div class="relative">
        <div
          v-if="props.brawlers.length > 1"
          class="z-0 absolute bottom-0 w-24"
        >
          <brawler-team
            :brawlers="props.brawlers"
          ></brawler-team>
        </div>
        <media-img
          v-if="props.brawlerId != undefined"
          :path="'/brawlers/' + props.brawlerId + '/avatar'"
          :alt="props.brawlers[0]"
          size="160"
          clazz="z-0 absolute bottom-0 h-20"
        ></media-img>
        <media-img
          v-if="props.icon !== ''"
          :path="props.icon"
          :alt="props.title"
          size="80"
          clazz="absolute bottom-0 h-10 rounded-full p-1 ml-20 bg-gray-800 bg-opacity-50"
        ></media-img>
        <div class="flex flex-col justify-center items-end">
          <slot name="stats"></slot>
        </div>
      </div>
    </template>
    <template v-slot:actions>
      <slot name="actions"></slot>
    </template>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export default Vue.extend({
  functional: true,
  props: {
    title: {
      type: String,
      required: true,
    },
    brawlers: {
      type: Array as PropType<string[]>,
      required: true,
    },
    brawlerId: {
      type: String,
    },
    icon: {
      type: String,
      default: '',
    },
  },
})
</script>
