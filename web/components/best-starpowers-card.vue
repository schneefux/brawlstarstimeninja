<template>
  <card
    :title="`Best ${kindName}`"
    xxs
  >
    <b-button
      slot="actions"
      :to="`/tier-list/${kind}`"
      primary
      prefetch
      sm
    >
      Open {{ kindNameSingular }} Tier List
    </b-button>

    <shimmer
      slot="content"
      :loading="$fetchState.pending"
      class="flex justify-around h-14"
    >
      <div
        v-for="entry in topStarpowers"
        :key="entry.id"
        class="flex-1 flex flex-col justify-end items-center"
      >
        <media-img
          :path="`/${kind}/${entry.id}`"
          size="160"
          clazz="h-10"
        ></media-img>
        <p class="text-xs">
          {{ commonMeasurements.winRate.formatter(entry.battle_victory) }}
          {{ commonMeasurements.winRate.nameShort }}
        </p>
      </div>
    </shimmer>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { capitalize } from '@/lib/util'
import { commonMeasurements } from '../lib/cube'

interface Row {
  brawler_id: number
  brawler_name: string
  brawler_starpower_id?: number
  brawler_starpower_name?: string
  brawler_gadget_id?: number
  brawler_gadget_name?: string
  battle_victory: number

  id?: number
}

export default Vue.extend({
  props: {
    kind: {
      type: String as PropType<'starpowers'|'gadgets'>,
      default: 'starpowers'
    },
  },
  data() {
    return {
      topStarpowers: [] as Row[],
    }
  },
  async fetch() {
    const cube = this.kind == 'starpowers' ? 'starpower' : 'gadget'
    const dimensions = this.kind == 'starpowers' ? ['brawler_starpower_id', 'brawler_starpower_name'] : ['brawler_gadget_id', 'brawler_gadget_name']
    const data = await this.$clicker.query('meta.starpower.widget', cube,
      ['brawler_id', 'brawler_name', ...dimensions],
      ['battle_victory'],
      {
        ...this.$clicker.defaultSlicesRaw('starpower'),
        [this.kind == 'starpowers' ? 'with_starpower' : 'with_gadget']: ['true'],
      },
      { sort: { picks: 'desc' }, limit: 3, cache: 60*60 })
    this.topStarpowers = data.data.map(e => (<Row>{
      ...e,
      id: this.kind == 'starpowers' ? e.brawler_starpower_id : e.brawler_gadget_id,
    }))
  },
  computed: {
    kindLong(): string {
      return this.kind == 'starpowers' ? 'Star Powers' : this.kind
    },
    kindName(): string {
      return capitalize(this.kindLong)
    },
    kindNameSingular(): string {
      return capitalize(this.kindLong).replace(/s$/, '')
    },
    commonMeasurements() {
      return commonMeasurements
    },
  },
})
</script>
