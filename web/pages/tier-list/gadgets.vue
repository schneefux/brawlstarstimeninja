<template>
  <page title="Gadget Tier List">
    <map-breadcrumbs gadgets></map-breadcrumbs>
    <p>
      Use the Gadget Tier List to find the best Gadget for all Brawlers in Brawl Stars. <br />
      The statistics are calculated as the difference between a Brawler with one Gadget and a Brawler with zero Gadgets.
    </p>

    <div class="flex flex-wrap justify-center">
      <best-gadgets-table
        full-height
        md
      ></best-gadgets-table>
    </div>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  middleware: ['cached'],
  head() {
    const description = `Brawl Stars Gadget Tier List. Find the best Gagdets for all Brawlers with Win Rates and Rankings.`
    return {
      title: `Gadget Tier List`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    title: 'Gadgets',
  },
  computed: {
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
})
</script>
