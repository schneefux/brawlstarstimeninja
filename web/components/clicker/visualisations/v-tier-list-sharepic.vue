<template>
  <sharepic @done="done">
    <card
      class="m-0! p-0! h-full"
      full-height
    >
      <template v-slot:content>
        <div
          v-for="(entries, tier) in tiers"
          :key="tier"
          class="py-1 mt-px flex bg-gray-900"
        >
          <div class="w-6 mx-2 flex justify-center items-center">
            <span class="text-2xl font-bold">{{ tier }}</span>
          </div>
          <div class="w-full flex flex-wrap justify-start">
            <div
              v-for="entry in entries"
              :key="entry.id"
            >
              <div class="my-px w-12 relative">
                <media-img
                  :path="`/brawlers/${brawlerId({ name: entry.dimensions.brawler })}/avatar`"
                  size="160"
                  clazz="h-8"
                ></media-img>
              </div>
            </div>
          </div>
        </div>
        <div class="w-full py-1 absolute bottom-0 left-0 z-10 px-3 flex justify-between text-xs tracking-tight text-gray-600">
          <span>
            <template v-if="description != undefined">
              {{ description }}
            </template>
            <template v-else>
              created {{ today }}
            </template>
          </span>
          <span>brawltime.ninja</span>
        </div>
      </template>
    </card>
  </sharepic>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { TierList } from '@/model/Web'
import { MetaGridEntry, brawlerId } from '@/lib/util'

// note: Using <media-img> is ok for this component
// because all images are already loaded by the parent tier list component.
// Usually, prefer <img> because html2canvas will not load <picture>s.

export default Vue.extend({
  props: {
    tiers: {
      type: Object as PropType<TierList>,
      required: true
    },
    description: {
      type: String,
      required: false
    },
  },
  computed: {
    brawlerId() {
      return brawlerId
    },
    today(): string {
      return new Date().toLocaleDateString()
    },
  },
  methods: {
    done() {
      this.$gtag.event('click', {
        'event_category': 'tierlist',
        'event_label': 'share',
      })
    },
  },
})
</script>
