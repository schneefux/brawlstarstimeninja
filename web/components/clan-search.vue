<template>
  <card
    title="Name Search"
    subtitle="Search common player names or Clans"
  >
    <template v-slot:content>
      <form @submit.prevent="$fetch">
        <input
          type="text"
          v-model="pattern"
          class="form-input bg-gray-800 text-gray-400"
        >
        <b-button
          tag="input"
          type="submit"
          value="Calculate"
          md
          primary
        ></b-button>
      </form>

      <dl>
        <div>
          <dt class="inline">Users</dt>
          <dd class="inline">{{ formatSI(data.users) }}</dd>
        </div>
        <div>
          <dt class="inline">Battles</dt>
          <dd class="inline">{{ commonMeasurements.picks.formatter(data.picks) }}</dd>
        </div>
        <div>
          <dt class="inline">{{ commonMeasurements.winRate.name }}</dt>
          <dd class="inline">{{ commonMeasurements.winRate.formatter(data.battle_victory) }}</dd>
        </div>
      </dl>
    </template>
  </card>
</template>

<script lang="ts">
import Vue from 'vue'
import { commonMeasurements } from '~/lib/cube'
import { formatSI } from '~/lib/util'

interface Row {
  picks: number
  users: number
  battle_victory: number
}

export default Vue.extend({
  data() {
    return {
      pattern: '',
      data: {} as Row,
    }
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('player.clan', 'battle',
      [], ['picks', 'users', 'battle_victory'], {
        ...this.$clicker.defaultSlicesRaw('battle'),
        trophy_season_end: ['current'],
        player_name_ilike: ['%' + this.pattern + '%'],
      }, {
        cache: 60*60,
      })

    this.data = data.data[0]
  },
  computed: {
    commonMeasurements() {
      return commonMeasurements
    },
    formatSI() {
      return formatSI
    },
  },
})
</script>
