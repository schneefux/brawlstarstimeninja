<template>
  <page title="Star Power Tier List">
    <map-breadcrumbs starpowers></map-breadcrumbs>
    <p>
      Use the Star Power Tier List to find the best Star Power for all Brawlers in Brawl Stars. <br />
      The statistics are calculated as the difference between a Brawler with one Star Power and a Brawler with zero Star Powers.
    </p>

    <div class="flex flex-wrap justify-center">
      <best-starpowers-table
        full-height
        md
      ></best-starpowers-table>
    </div>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  middleware: ['cached'],
  head() {
    const description = `Brawl Stars Star Power Tier List. Find the best Star Power for all Brawlers with Win Rates and Rankings.`
    return {
      title: `Star Power Tier List`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    title: 'Star Powers',
  },
  computed: {
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
})
</script>
