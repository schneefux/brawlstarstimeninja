<template>
  <card
    v-if="dimensions.length == 1 && measurements.length == 1"
    v-bind="$attrs"
  >
    <template v-slot:content>
      <ul>
        <li
          v-for="(entries, tier) in tiers"
          :key="tier"
          class="my-4 flex"
        >
          <div class="w-6 mr-3 flex justify-center items-center">
            <span class="text-2xl sm:text-2xl md:text-3xl font-bold">{{ tier }}</span>
          </div>
          <ul class="w-full flex flex-wrap justify-start items-center">
            <li
              v-for="entry in entries"
              :key="entry.id"
              class="my-px"
            >
              <slot
                :name="`dimensions.${dimensions[0].id}`"
                :row="entry"
              ></slot>
            </li>
          </ul>
        </li>
      </ul>

      <div
        v-if="dimensions[0].id == 'brawler'"
        class="mt-2"
      >
        <v-tier-list-sharepic
          :tiers="tiers"
        ></v-tier-list-sharepic>
      </div>
    </template>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { TierList, TierListEntry } from '~/model/Web'
import { MetaGridEntry, scaleEntriesIntoTiers } from '@/lib/util'
import VTierListSharepic from '~/components/clicker/visualisations/v-tier-list-sharepic.vue'
import { Dimension, Measurement } from '~/lib/cube'

function groupTiers(entries: MetaGridEntry[], m: Measurement): TierList {
  if (entries.length <= 2) {
    return {}
  }

  const scaledEntries = scaleEntriesIntoTiers(entries, m)

  const tierMap = { S: [], A: [], B: [], C: [], D: [] } as Record<string, MetaGridEntry[]>
  scaledEntries.forEach(e => e.tier in tierMap ? tierMap[e.tier].push(e) : tierMap[e.tier] = [e])

  return tierMap
}

export default Vue.extend({
  inheritAttrs: false,
  components: {
    VTierListSharepic,
  },
  props: {
    data: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true
    },
    measurements: {
      type: Array as PropType<Measurement[]>,
      required: true
    },
    dimensions: {
      type: Array as PropType<Dimension[]>,
      required: true
    },
  },
  computed: {
    tiers(): TierList {
      return groupTiers(this.data, this.measurements[0])
    },
  },
})
</script>
