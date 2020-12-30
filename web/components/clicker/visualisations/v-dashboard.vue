<template>
  <div>
    <div class="w-full flex flex-wrap">
      <slot
        name="visualisations"
        :loading="loading"
        :data="data"
        :dimensions="dimensions"
        :measurements="measurements"
        full-height
      ></slot>
    </div>

    <div class="w-full flex flex-wrap">
      <v-graph
        :loading="loading"
        :data="data"
        :dimensions="dimensions"
        :measurements="measurements"
        title="Graph View"
        class="flex-1 h-80"
        full-height
      ></v-graph>
    </div>

    <div class="w-full flex flex-wrap justify-center">
      <v-table
        :loading="loading"
        :data="data"
        :dimensions="dimensions"
        :measurements="measurements"
        title="Table View"
        sm
        full-height
      >
        <template
          v-for="(_, name) in $scopedSlots"
          v-slot:[name]="data"
        >
          <slot
            :name="name"
            v-bind="data"
          ></slot>
        </template>
      </v-table>

      <div class="flex-1 flex flex-col">
        <v-tier-list
          :loading="loading"
          :data="data"
          :dimensions="dimensions"
          :measurements="measurements"
          full-height
          class="h-full"
        >
          <template
            v-for="(_, name) in $scopedSlots"
            v-slot:[name]="data"
          >
            <slot
              :name="name"
              v-bind="data"
            ></slot>
          </template>
        </v-tier-list>

        <v-grid
          :loading="loading"
          :data="data"
          :dimensions="dimensions"
          :measurements="measurements"
          full-height
          class="h-full"
        >
          <template
            v-for="(_, name) in $scopedSlots"
            v-slot:[name]="data"
          >
            <slot
              :name="name"
              v-bind="data"
            ></slot>
          </template>
        </v-grid>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Dimension, Measurement } from '~/lib/cube'
import { MetaGridEntry } from '~/lib/util'

export default Vue.extend({
  props: {
    loading: {
      type: Boolean,
      required: true
    },
    data: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true
    },
    dimensions: {
      type: Array as PropType<Dimension[]>,
      required: true
    },
    measurements: {
      type: Array as PropType<Measurement[]>,
      required: true
    },
  },
})
</script>
