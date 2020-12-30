<template>
  <page :title="brawlerName">
    <map-breadcrumbs
      :brawler-id="brawlerId"
      :brawler-name="brawlerName"
    ></map-breadcrumbs>

    <page-section>
      <div class="flex flex-wrap justify-center">
        <brawler-base-stats
          :brawler-id="brawlerId"
          :brawler-name="brawlerName"
        ></brawler-base-stats>

        <brawler-starpower-stats
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'starpowers'),
            once: true,
          }"
          :brawler-id="brawlerId"
          :brawler-name="brawlerName"
          kind="starpowers"
        ></brawler-starpower-stats>

        <brawler-starpower-stats
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'gadgets'),
            once: true,
          }"
          :brawler-id="brawlerId"
          :brawler-name="brawlerName"
          kind="gadgets"
        ></brawler-starpower-stats>

        <p class="mt-4">
          Info:
          Star Power and Gadget statistics are calculated as the difference between a Brawler with one Star Power or Gadget and a Brawler with zero Star Powers or Gadgets.
        </p>

        <div class="mt-2 w-full flex justify-end">
          <b-button
            to="/tier-list/starpowers"
            primary
            sm
            prefetch
          >
            Open Star Power Tier List
          </b-button>

          <b-button
            class="ml-3"
            to="/tier-list/gadgets"
            primary
            sm
            prefetch
          >
            Open Gadget Tier List
          </b-button>
        </div>
      </div>
    </page-section>

    <client-only>
      <adsense
        id="ezoic-pub-ad-placeholder-108"
        ins-class="w-full md:w-1/2 mt-4 mx-auto"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="8533352178"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>

    <page-section
      :title="'Synergies for ' + brawlerName"
      tracking-id="synergies"
      tracking-page-id="brawler"
    >
      <brawler-synergies-card
        :brawler="brawlerName"
        class="mx-auto"
      ></brawler-synergies-card>
    </page-section>

    <page-section
      :title="'Current Maps for ' + brawlerName"
      tracking-id="current-maps"
      tracking-page-id="brawler"
    >
      <brawler-active-events
        :show-all-maps="showAllMaps"
        :brawler-name="brawlerName"
      ></brawler-active-events>

      <div class="mt-1 w-full flex justify-end">
        <b-button
          @click="showAllMaps = true"
          :class="{ 'md:block': !showAllMaps }"
          class="mr-3 hidden"
          sm
          primary
        >
          Show More
        </b-button>
        <b-button
          to="/tier-list/map"
          sm
          primary
          prefetch
        >
          Open Map Tier Lists
        </b-button>
      </div>
    </page-section>

    <page-section
      :title="brawlerName + ' Trends'"
      tracking-id="trends"
      tracking-page-id="brawler"
    >
      <p slot="description">
        See how {{ brawlerName }} has performed this month.
      </p>

      <brawler-trends-card
        :brawler="brawlerName"
      ></brawler-trends-card>
    </page-section>

    <page-section
      :title="brawlerName + ' Statistics by Trophies'"
      tracking-id="trophy-graphs"
      tracking-page-id="brawler"
    >
      <brawler-trophy-graphs
        :brawler-name="brawlerName"
      ></brawler-trophy-graphs>

      <p class="mt-4">
        Info:
        Statistics are generated with data from Brawl Time Ninja's visitors.
        These players are usually better than the average.
      </p>

      <div class="mt-1 w-full flex justify-end">
        <b-button
          to="/tier-list/brawler"
          primary
          sm
          prefetch
        >
          Open Brawler Tier List
        </b-button>
      </div>
    </page-section>

    <page-section
      :title="'Best Modes for ' + brawlerName"
      tracking-id="modes"
      tracking-page-id="brawler"
    >
      <brawler-modes-stats
        :brawler-id="brawlerId"
        :brawler-name="brawlerName"
        :show-all-modes="showAllModes"
      ></brawler-modes-stats>

      <p class="mt-2">
        Info:
        A Brawler is considered viable on a map if the Brawler has an above average number of wins on that map.
      </p>

      <div class="mt-1 w-full flex justify-end">
        <b-button
          @click="showAllModes = true"
          :class="{ 'md:block': !showAllModes }"
          class="mr-3 hidden"
          sm
          primary
        >
          Show More
        </b-button>
      </div>
    </page-section>

    <client-only>
      <adsense
        v-if="!isApp"
        id="ezoic-pub-ad-placeholder-109"
        ins-class="w-full mt-6 mx-auto h-32"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6837127123"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaInfo } from 'vue-meta'
import { capitalizeWords } from '@/lib/util'

export default Vue.extend({
  head(): MetaInfo {
    const description = `${this.brawlerName} Brawl Stars stats. Best Star Power and best Gadget for ${this.brawlerName} with win rate and pick rates for all modes.`
    return {
      title: `${this.brawlerName} in Brawl Stars`,
      link: [ {
        rel: 'canonical',
        href: `/tier-list/brawler/${this.brawlerId}`,
      } ],
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  middleware: ['cached'],
  data() {
    return {
      brawlerId: '',
      brawlerName: '',
      showAllModes: false,
      showAllMaps: false,
    }
  },
  computed: {
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  async asyncData({ params }) {
    const brawlerId = params.brawler
    return {
      brawlerId,
      brawlerName: capitalizeWords(brawlerId.replace(/__/g, '. ').replace(/_/g, ' ')), // TODO this does not restore '.' (Mr. P) or '-' (8-Bit)
    }
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string): void {
      if (visible) {
        this.$gtag.event('scroll', {
          'event_category': 'brawler',
          'event_label': section,
        })
      }
    },
  },
})
</script>
