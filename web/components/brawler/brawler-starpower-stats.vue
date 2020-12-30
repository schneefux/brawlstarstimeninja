<template>
  <div class="flex flex-wrap justify-around">
    <brawler-starpower-card
      v-for="entry in data"
      :key="entry.id"
      :id="entry.id"
      :kind="kind"
      :name="getName(entry)"
      :brawler-name="brawlerName"
      :content="content"
      :description="getDescription(entry)"
      :win-rate="entry.battle_victory"
      :without-win-rate="totals.battle_victory"
    ></brawler-starpower-card>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BrawlerContent } from '~/model/Web'
import { BrawlerStatisticsRows } from '@/model/Clicker'
import { BrawlerData } from '@/model/Media'

interface Row {
  brawler_starpower_id?: number
  brawler_starpower_name?: string
  brawler_gadget_id?: number
  brawler_gadget_name?: string
  battle_victory: number

  id?: number
}

export default Vue.extend({
  props: {
    brawlerId: {
      type: String,
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
    kind: {
      type: String, // 'starpowers', 'gadgets'
      required: true
    },
  },
  data() {
    return {
      content: null as BrawlerContent|null,
      data: [] as Row[],
      totals: null as Row|null,
      descriptions: null as Record<string, string>|null,
    }
  },
  fetchDelay: 0,
  async fetch() {
    this.content = await this.$content(`/brawlers/${this.brawlerId}`).fetch().catch(err => null) as BrawlerContent|null

    const dimensions = this.kind == 'starpowers' ? ['brawler_starpower_id', 'brawler_starpower_name'] : ['brawler_gadget_id', 'brawler_gadget_name']
    const cube = this.kind == 'starpowers' ? 'starpower' : 'gadget'

    // TODO queries could be combined
    const dataWith = await this.$clicker.query('meta.starpower.brawler-widget', cube,
      dimensions,
      ['battle_victory'],
      {
        ...this.$clicker.defaultSlicesRaw('starpower'),
        brawler_name: [this.brawlerName.toUpperCase()], // TODO use the ID
        [this.kind == 'starpowers' ? 'with_starpower' : 'with_gadget']: ['true'],
      },
      { sort: { timestamp: 'desc' }, cache: 60*60 })

    const dataWithout = await this.$clicker.query('meta.starpower.brawler-widget', cube,
      dimensions,
      ['battle_victory'],
      {
        ...this.$clicker.defaultSlicesRaw('starpower'),
        brawler_name: [this.brawlerName.toUpperCase()], // TODO use the ID
        [this.kind == 'starpowers' ? 'with_starpower' : 'with_gadget']: ['false'],
      },
      { sort: { timestamp: 'desc' }, cache: 60*60 })

    this.data = (dataWith.data as unknown as Row[]).map(r => ({
      ...r,
      id: this.kind == 'gadgets' ? r.brawler_gadget_id : r.brawler_starpower_id,
    }))
      // in case of duplicate IDs, use the first (most recent)
      .filter((el, index, all) => all.findIndex(e => e.id == el.id) == index)

    this.totals = dataWithout.data[0]

    const info = await this.$axios.$get(`${process.env.mediaUrl}/brawlers/${this.brawlerId}/info`).catch(() => null) as BrawlerData|null
    if (info != null) {
      if (this.kind == 'starpowers') {
        this.descriptions = info.starpowerDescriptions
      } else {
        this.descriptions = info.gadgetDescriptions
      }
    }
  },
  computed: {
    getName() {
      return (entry: Row) => this.kind == 'gadgets' ? entry.brawler_gadget_name : entry.brawler_starpower_name
    },
    getDescription() {
      return (entry: Row) => {
        const name = this.getName(entry)
        if (this.descriptions != null && name != null && name in this.descriptions) {
          return this.descriptions[name]
        }
        return undefined
      }
    },
  },
})
</script>
