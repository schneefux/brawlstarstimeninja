<template>
  <page title="Brawl-o-ween Tier Lists">
    <p>Open on a map to see the best Brawlers for all Brawl-o-ween Brawl Stars Events.</p>

    <client-only>
      <adsense
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="8877810024"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>

    <div class="flex flex-wrap justify-center">
      <map-best-brawlers-card
        v-for="event in events"
        :key="event.id"
        :id="event.id"
        :mode="unformatMode(event.mode)"
        :map="event.map"
        link
      ></map-best-brawlers-card>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="3577381889"
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
import { formatAsJsonLd, unformatMode } from '@/lib/util'
import { CurrentAndUpcomingEvents, ActiveEvent } from '@/model/Api'

export default Vue.extend({
  data() {
    const events: ActiveEvent[] = [{
      id: '15000115',
      map: 'Double Swoosh',
      mode: 'Gem Grab',
      start: '2020-10-30T00:00:00.000Z',
      end: '2020-11-01T23:59:59.999Z',
    }, {
      id: '15000023',
      map: 'G.G. Mortuary',
      mode: 'Heist',
      start: '2020-10-30T00:00:00.000Z',
      end: '2020-11-01T23:59:59.999Z',
    }, {
      id: '15000005',
      map: 'Shooting Star',
      mode: 'Bounty',
      start: '2020-10-30T00:00:00.000Z',
      end: '2020-11-01T23:59:59.999Z',
    }, {
      id: '15000300',
      map: 'Ring of Fire',
      mode: 'Hot Zone',
      start: '2020-10-30T00:00:00.000Z',
      end: '2020-11-01T23:59:59.999Z',
    }]

    return {
      events,
      unformatMode,
    }
  },
  head(): MetaInfo {
    const description = 'Brawl Stars Brawl-o-ween Tier List with Win Rates, Pick Rates and Rankings. Find the best Brawlers for all maps.'
    const structuredData = this.events
      .map((event) => ({
        type: 'application/ld+json',
        json: formatAsJsonLd(event),
      }))

    return {
      title: 'Brawl-o-ween Tier List',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ],
      script: structuredData,
    }
  },
  computed: {
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
})
</script>
