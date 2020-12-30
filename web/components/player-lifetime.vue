<template>
  <dl
    :class="['flex flex-col md:flex-row md:flex-wrap md:justify-center', {
      'flex-wrap justify-center': !tease,
      'h-32 md:h-12 overflow-hidden': tease,
    }]"
  >
    <card
      v-for="(value, name) in stats"
      :key="name"
      elevation="2"
      dense
    >
      <div
        slot="content"
        class="text-lg flex"
      >
        <dd class="text-yellow-400 font-semibold w-16 md:w-auto text-right">{{ value }}</dd>
        <dt class="ml-2 w-full overflow-hidden">{{ commonMeasurements[name].name }}</dt>
      </div>
    </card>
  </dl>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { commonMeasurements } from '~/lib/cube'
import { Player } from '~/model/Brawlstars'

export default Vue.extend({
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
    tease: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    stats(): Record<string, number> {
      return {
        trophies: this.player.trophies,
        highestTrophies: this.player.highestTrophies,
        powerPlayPoints: this.player.powerPlayPoints,
        highestPowerPlayPoints: this.player.highestPowerPlayPoints,
        expLevel: this.player.expLevel,
        victories: this.player['3vs3Victories'],
        soloVictories: this.player.soloVictories,
        duoVictories: this.player.duoVictories,
      }
    },
    commonMeasurements() {
      return commonMeasurements
    },
  },
})
</script>
