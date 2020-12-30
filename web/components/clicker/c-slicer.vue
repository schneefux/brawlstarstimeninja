<template>
  <card v-bind="$attrs">
    <template v-slot:content>
      <div class="flex md:hidden">
        <b-button
          :selected="showFilters"
          primary
          sm
          class="mr-3 h-8"
          @click="showFilters = !showFilters"
        >
          <font-awesome-icon
            :icon="faFilter"
          ></font-awesome-icon>
        </b-button>

        <span
          :class="['my-auto leading-tight ', {
            'whitespace-nowrap overflow-hidden overflow-ellipsis': !showFilters,
          }]"
          @click="showFilters = true"
        >
          description
        </span>
      </div>

      <div
        :class="['md:flex flex-wrap', {
          'hidden': !showFilters,
          'mt-3': showFilters,
        }]"
      >
        <h1 class="text-xl font-semibold hidden md:inline my-1 mr-4">Filters</h1>
        <slot
          v-for="s in sliceIds"
          :name="`slices.${s}`"
          :value="value"
        ></slot>
      </div>
    </template>
  </card>
</template>

<script lang="ts">
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import Vue, { PropType } from 'vue'
import { Config, SliceValue } from '~/lib/cube'

export default Vue.extend({
  props: {
    value: {
      type: Object as PropType<SliceValue>,
      required: true
    },
    config: {
      type: Object as PropType<Config>,
      required: true
    },
    cubeId: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      showFilters: false,
    }
  },
  computed: {
    sliceIds(): string[] {
      return this.config[this.cubeId].slices.map(s => s.id)
    },
    faFilter() {
      return faFilter
    },
  },
})
</script>
