<template>
  <client-only v-if="eventRecommendations.length > 0 && notificationsAllowed">
    <b-button
      primary
      @click="notifyTips"
    >
      Send Notification
    </b-button>
  </client-only>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { capitalizeWords, getBestBrawlers, formatMode } from '@/lib/util'
import { MapMeta, MapMetaMap } from '../model/MetaEntry'
import { Player, BrawlerMetaStatistics } from '@/model/Api'

interface Recommendation {
  id: string
  phrase: string
  score: number
  brawler: string
  map: string
  mode: string
  eventId: string
}

export default Vue.extend({
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
    activeMapMeta: {
      type: Object as PropType<MapMetaMap>,
      required: true,
    },
  },
  data() {
    return {
      notificationsAllowed: false,
      tipsPage: 1,
      tipsPageSize: 3,
      formatMode,
    }
  },
  created() {
    if ((<any>process).client && 'Notification' in window) {
      this.notificationsAllowed = Notification.permission !== 'denied'
    }
  },
  computed: {
    eventRecommendations(): Recommendation[] {
      const phrases = [
        'Get more trophies by playing',
        'You can push',
        'Try to play',
        'To gain some trophies, play',
        'Other players had success with',
        'You should try',
        'For easy wins, play',
      ]
      const recommendations = [] as Recommendation[]
      const worstBrawlers = Object.values((this.player as Player).brawlers)
        .sort((b1, b2) => b1.trophies - b2.trophies)

      // sort by score =
      // index [ brawlers owned by player, worst first ]
      // *
      // index [ brawler in map meta, best first ]
      Object.entries(this.activeMapMeta).forEach(([id, mapMeta]) => {
        const meta = mapMeta as MapMeta

        const bestBrawlers = getBestBrawlers(Object.values(meta.brawlers).map(v => ({ ...v, id: v.name }))) as BrawlerMetaStatistics[]
        worstBrawlers.forEach((worstBrawler, worstBrawlerIndex) => {
          const bestBrawlerIndex = bestBrawlers.findIndex(b => b.name.toLowerCase() == worstBrawler.name.toLowerCase())
          if (bestBrawlerIndex == -1) {
            return
          }

          const score = (worstBrawler.trophies + 1) * (bestBrawlerIndex / bestBrawlers.length + 1)
          recommendations.push({
            id: `${worstBrawler.name} ${id}`,
            phrase: phrases[Math.round(parseInt(id) / 31) % phrases.length],
            score,
            brawler: worstBrawler.name,
            map: meta.map,
            mode: meta.mode,
            eventId: id,
          })
        })
      })
      recommendations.sort((r1, r2) => r1.score - r2.score)
      return recommendations.slice(0, 20)
    },
  },
  methods: {
    async notifyTips() {
      if (!(Notification.permission in ['denied', 'granted'])) {
        await Notification.requestPermission()
      }

      if (Notification.permission !== 'granted') {
        this.notificationsAllowed = false
        return
      }

      this.$gtag.event('send_notification', {
        'event_category': 'profile',
        'event_label': 'tips',
      })
      this.notificationsAllowed = true

      const sw = await navigator.serviceWorker.ready

      const eventDescription = (r: Recommendation) => formatMode(r.mode) + ' - ' + r.map
      const N = 5
      const topNByEvent = (this.eventRecommendations as Recommendation[])
        .reduce((topNByEvent, recommendation) => ({
          ...topNByEvent,
          [eventDescription(recommendation)]: [
            ...(topNByEvent[eventDescription(recommendation)] || []),
            capitalizeWords(recommendation.brawler.toLowerCase())
          ].slice(0, N)
        }), {} as { [description: string]: string[] })
      const tips = [...Object.entries(topNByEvent)]
        .map(([eventDescription, topN]) => 'Play ' + topN.join(', ') + ' in ' + eventDescription)
      sw.showNotification(`Tips for ${this.player.name} by Brawl Time Ninja`, {
        body: tips.join('\n')
      })
    },
  },
})
</script>
