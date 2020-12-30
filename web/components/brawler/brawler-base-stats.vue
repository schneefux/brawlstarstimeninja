<template>
  <div class="flex flex-wrap justify-center w-full md:w-auto">
    <div class="w-full flex justify-center">
      <card full-height xxl>
        <div
          slot="content"
          class="max-w-xl flex flex-wrap md:flex-nowrap justify-center items-center mx-auto md:py-10 md:px-6"
        >
          <div class="w-32 md:w-48 md:pr-6 h-64 flex justify-center items-center">
            <media-img
              :path="'/brawlers/' + brawlerId + '/model'"
              :alt="brawlerName"
              size="500"
            ></media-img>
          </div>
          <div class="w-full">
            <h1 class="text-xl font-semibold mb-3">{{ brawlerName }}</h1>
            <p>
              <q
                v-if="gamefileDescription != ''"
                class="italic"
              >{{ gamefileDescription }}</q>
              <template v-if="content != null">
                <br>
                {{ content.description || '' }}
              </template>
              <template v-if="content == null && generatedDescription != ''">
                <br>
                {{ generatedDescription }}
              </template>
            </p>
            <kv-table
              class="mt-3"
              :data="infoTable"
            ></kv-table>
          </div>
        </div>
      </card>
    </div>

    <template v-if="info != null">
      <brawler-attack-stats-card
        v-for="attack in ['main', 'super']"
        :key="attack"
        :attack="attack"
        :info="info"
        :content="content"
      ></brawler-attack-stats-card>
    </template>

    <card
      v-if="data != null"
      :title="brawlerName + ' Statistics'"
      full-height
      md
    >
      <template v-slot:content>
        <p>{{ statisticsDescription }}</p>
        <kv-table
          :data="statsTable"
          class="mt-3"
        ></kv-table>
      </template>
    </card>
  </div>
</template>

<script lang="ts">
import { IContentDocument } from '@nuxt/content/types/content'
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import { commonMeasurements } from '~/lib/cube'
import { capitalize, scaleInto } from '~/lib/util'
import { BrawlerData } from '~/model/Media'
import { BrawlerContent } from '~/model/Web'

interface Row {
  brawler_name: string
  picks_weighted: number
  battle_victory: number
  battle_starplayer: number
}

function expandContentWithInfo(content: BrawlerContent, info: BrawlerData) {
  function detectGender() {
    const text = info.description.toLowerCase()
    if (text.includes(' she ') || text.includes(' her ')) {
      return 'f'
    }
    if (text.includes(' he ') || text.includes(' his ') || text.includes(' him ')) {
      return 'm'
    }
    return 't'
  }

  function replaceSkillKeys(text: string, skill: 'main'|'super') {
    const formatSeconds = (n: number) => n / 1000 + 's'
    return text
      .replace('$damage', info[skill]?.damage != undefined ? (info[skill].damage! * 1.4).toString() : '')
      .replace('$rechargetime', formatSeconds(info[skill].rechargeTime))
      .replace('$range', info[skill].range?.toFixed(1) || '')
  }

  if (content.gender == undefined) {
    content.gender = detectGender()
  }

  if (content.main != undefined) {
    content.main = replaceSkillKeys(content.main, 'main')
  }
  if (content.super != undefined) {
    content.super = replaceSkillKeys(content.super, 'super')
  }

  return content
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
  },
  data() {
    return {
      // game files
      info: null as BrawlerData|null,
      // cms
      content: null as BrawlerContent|null,
      // clicker data
      data: null as Row|null,
      totals: null as Row|null,
    }
  },
  fetchDelay: 0,
  async fetch() {
    const info = await this.$axios.$get<BrawlerData>(`${process.env.mediaUrl}/brawlers/${this.brawlerId}/info`).catch(() => null)
    this.info = info

    let content = await this.$content(`/brawlers/${this.brawlerId}`).fetch().catch(err => null) as BrawlerContent|null

    if (content != null && info != null) {
      content = expandContentWithInfo(content, info)
    }

    this.content = content

    const data = await this.$clicker.query<Row>('meta.brawler.base-stats-widget', 'map',
      ['brawler_name'],
      ['battle_victory', 'battle_starplayer', 'picks_weighted'], {
        ...this.$clicker.defaultSlicesRaw('map'),
        brawler_name: [this.brawlerName.toUpperCase()],
      },
      { sort: { picks: 'desc' }, cache: 60*60 })

    const totalData = await this.$clicker.query<Row>('meta.brawler.base-stats-widget', 'map',
      [],
      ['battle_victory', 'battle_starplayer', 'picks_weighted'], {
        ...this.$clicker.defaultSlicesRaw('map'),
      },
      { sort: { picks: 'desc' }, cache: 60*60 })

    // TODO use ID
    this.data = data.data[0]
    this.totals = totalData.data[0]
  },
  computed: {
    pronoun(): string {
      if (this.content == undefined) {
        return this.brawlerName
      }

      return {
        'm': 'he',
        'f': 'she',
        't': 'they',
      }[this.content.gender]
    },
    possessivePronoun(): string {
      if (this.content == undefined) {
        return this.brawlerName + '\'s'
      }

      return {
        'm': 'his',
        'f': 'her',
        't': 'their',
      }[this.content.gender]
    },
    gamefileDescription(): string {
      return this.info?.description || ''
    },
    generatedDescription(): string {
      if (this.info == null) {
        return ''
      }
      return `
        ${this.info.class ? `${this.brawlerName} is a ${this.info.class}${this.info.rarity && ` with ${this.info.rarity} Rarity.`}` : (this.info.rarity && `${this.brawlerName}'s Rarity is ${this.info.rarity}.`)}\
        ${capitalize(this.pronoun)} is unlocked ${this.info.unlock ? this.info.unlock == 0 ? `when starting the game` : `upon reaching ${this.info.unlock} Trophies` : `by opening Brawl Boxes`}.
      `.trim()
    },
    statisticsDescription(): string {
      if (this.data == undefined || this.totals == undefined) {
        return ''
      }

      const popularityWords = ['niche', 'not so popular', 'moderately popular', 'very popular']
      const useRate = this.data.picks_weighted / this.totals.picks_weighted
      const popularity = popularityWords[scaleInto(0.02, 0.03, popularityWords.length - 1, useRate)]

      const metanessWords = ['not that good', 'below average', 'average', 'above average', 'excellent']
      const metaness = metanessWords[scaleInto(0.55, 0.60, metanessWords.length - 1, this.data.battle_victory)]

      return `
        ${this.brawlerName} is, judging by ${this.possessivePronoun} Use Rate, a ${popularity} Brawler.\
        Looking at ${this.possessivePronoun} Win Rate, ${this.pronoun} is ${metaness} in the current Meta.
      `
    },
    infoTable(): string[][] {
      if (this.info == null) {
        return []
      }

      return [
        [ 'Health at Level 1', this.info.health.toString() ],
        [ 'Health at Level 10', Math.round(this.info.health * 1.4).toString() ],
        [ 'Speed', Math.round(this.info.speed * 100) / 100 + 'Tiles/s' ],
      ]
    },
    statsTable(): string[][] {
      if (this.data == null || this.totals == null) {
        return []
      }

      return [
        [ commonMeasurements.useRate.name, commonMeasurements.useRate.formatter(this.data.picks_weighted / this.totals.picks_weighted) ],
        [ commonMeasurements.starRate.name, commonMeasurements.starRate.formatter(this.data.battle_starplayer) ],
        [ commonMeasurements.winRate.name, commonMeasurements.winRate.formatter(this.data.battle_victory) ],
      ]
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers,
    })
  },
})
</script>
