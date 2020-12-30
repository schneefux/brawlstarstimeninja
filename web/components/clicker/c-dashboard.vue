<template>
  <div class="flex flex-wrap justify-center">
    <c-configurator
      v-model="configuration"
      :config="config"
      class="w-full"
    ></c-configurator>

    <c-slicer
      :config="config"
      :cube-id="configuration.cubeId"
      v-model="configuration.slices"
      class="w-full sticky z-10 top-12 lg:top-0!"
    >
      <template
        v-for="(_, name) in $scopedSlots"
        v-slot:[name]="data"
      >
        <slot
          v-if="name.startsWith('slices.')"
          :name="name"
          v-bind="data"
        ></slot>
      </template>
    </c-slicer>

    <c-query
      :config="config"
      :dimensions-ids="configuration.dimensionsIds"
      :measurements-ids="configuration.measurementsIds"
      :slices-values="configuration.slices"
      :cube-id="configuration.cubeId"
      :sort-id="configuration.measurementsIds[0]"
    >
      <template v-slot="data">
        <v-dashboard v-bind="data">
          <template
            v-for="(_, name) in $scopedSlots"
            v-slot:[name]="data"
          >
            <slot
              v-if="name.startsWith('dimensions.') || name.startsWith('measurements.') || name == 'visualisations'"
              :name="name"
              v-bind="data"
            ></slot>
          </template>
        </v-dashboard>
      </template>
    </c-query>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import config, { Cube, SliceValue } from '~/lib/cube'
import VTable from './visualisations/v-table.vue'
import VGraph from './visualisations/v-graph.vue'
import VGrid from './visualisations/v-grid.vue'
import VTierList from './visualisations/v-tier-list.vue'
import CDashboard from './c-dashboard.vue'
import CSlicer from './c-slicer.vue'
import CConfigurator, { Configuration } from './c-configurator.vue'

export default Vue.extend({
  components: {
    VTable,
    VGrid,
    VGraph,
    VTierList,
    CDashboard,
    CSlicer,
    CConfigurator,
  },
  props: {
    config: {
      type: Object as PropType<Record<string, Cube>>,
      required: true
    },
    defaultCube: {
      type: String,
      required: true
    },
    defaultSlices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
    defaultMeasurements: {
      type: Array as PropType<string[]>,
      required: true
    },
    defaultDimensions: {
      type: Array as PropType<string[]>,
      required: true
    },
  },
  data() {
    const cubeId = this.defaultCube || 'map'
    return {
      configuration: {
        cubeId,
        slices: this.defaultSlices || this.$clicker.defaultSlices(cubeId),
        dimensionsIds: this.defaultDimensions || [this.config[cubeId].defaultDimensionId],
        measurementsIds: this.defaultMeasurements || [this.config[cubeId].defaultMeasurementId],
      } as Configuration,
    }
  },
})
</script>

<style lang="postcss" scoped>
.top-12 {
  top: 3rem;
}

@responsive {
  .top-0\! {
    @apply top-0 !important;
  }
}
</style>
