<template>
  <card v-bind="$attrs">
    <div
      slot="content"
      class="flex flex-wrap justify-center"
    >
      <card
        v-for="(entry, index) in data.slice(page*pageSize, (page+1)*pageSize)"
        :key="entry.id"
        :title="dimensions.map(d => entry.dimensions[d.id]).join(', ')"
        elevation="2"
        itemscope
        itemtype="http://schema.org/Person"
      >
        <span
          slot="preview"
          class="text-right font-semibold text-xl ml-auto"
        >#{{ index + page*pageSize + 1 }}</span>
        <div
          slot="content"
          class="flex flex-wrap"
        >
          <div class="mb-4 mr-2">
            <div
              v-for="d in dimensions"
              :key="d.id"
            >
              <slot
                :name="`dimensions.${d.id}`"
                :row="entry"
              ></slot>
            </div>
          </div>
          <table>
            <tbody>
              <tr
                v-for="m in measurements"
                :key="m.id"
                class="whitespace-nowrap"
                itemscope
                itemtype="http://schema.org/QuantitativeValue"
              >
                <td class="text-center">
                  <img
                    v-if="m.icon.length > 2"
                    :src="require(`~/assets/images/icon/${m.icon}_optimized.png`)"
                    :alt="m.name"
                    class="card-prop-icon inline"
                  >
                  <!-- use emojis (length 2) -->
                  <span
                    v-else
                    class="card-prop-icon"
                  >
                    {{ m.icon }}
                  </span>
                </td>
                <td class="card-prop-value text-right pr-1" itemprop="unitText">
                  {{ entry.measurements[m.id] }}
                </td>
                <td class="card-prop-label" itemprop="value">
                  {{ m.name }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </card>
    </div>
    <div
      slot="actions"
      class="w-full flex justify-center"
    >
      <b-button
        v-if="page > 0"
        class="mr-1 w-32"
        primary
        @click="page--"
      >Previous Page</b-button>
      <b-button
        v-if="(page+1)*pageSize < data.length"
        class="ml-1 w-32"
        primary
        @click="page++"
      >Next Page</b-button>
    </div>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { MetaGridEntry } from '@/lib/util'
import BrawlerTeam from '~/components/brawler-team.vue'
import { Dimension, Measurement } from '~/lib/cube'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    dimensions: {
      type: Array as PropType<Dimension[]>,
      required: true
    },
    measurements: {
      type: Array as PropType<Measurement[]>,
      required: true
    },
    data: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true,
    },
    pageSize: {
      type: Number,
      default: 6
    }
  },
  data() {
    return {
      page: 0,
    }
  },
  watch: {
    data() {
      this.page = 0
    },
  },
})
</script>
