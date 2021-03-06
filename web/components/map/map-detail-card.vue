<template>
  <event-card
    v-bind="$attrs"
    :mode="mode"
    :map="map"
    nobackground
  >
    <div
      slot="content"
      class="flex flex-wrap justify-evenly items-center"
    >
      <media-img
        v-if="id != undefined"
        :path="id != 0 ? `/maps/${id}` : `/maps/competition-winners/${map.replace('Competition Winner ', '')}`"
        size="512"
        clazz="h-64"
      ></media-img>

      <div>
        <card
          v-if="timestamp != undefined"
          elevation="2"
        >
          <dl
            slot="content"
            class="flex justify-between"
          >
            <dt class="text-left font-semibold mr-1">
              Last Online:
            </dt>
            <dd class="text-right ml-1">
              {{ lastOnlineString }}
            </dd>
          </dl>
        </card>

        <card elevation="2">
          <map-balance-score
            slot="content"
            :mode="mode"
            :map="map"
            :season="season"
          ></map-balance-score>
        </card>

        <card
          title="Best Brawlers"
          elevation="2"
        >
          <map-best-brawlers
            slot="content"
            :mode="mode"
            :map="map"
            :season="season"
            elevation="3"
          ></map-best-brawlers>
        </card>

        <card
          v-if="mode != 'soloShowdown'"
          title="Teams with most wins"
          elevation="2"
        >
          <map-best-teams
            slot="content"
            :mode="mode"
            :map="map"
            :season="season"
          ></map-best-teams>
        </card>
      </div>
    </div>

    <template v-slot:actions>
      <slot name="actions"></slot>
      <b-button
        v-if="link"
        tag="router-link"
        :to="localePath(linkTarget)"
        primary
        sm
      >
        Open
      </b-button>
    </template>
  </event-card>
</template>

<script lang="ts">
import { differenceInMinutes, formatDistanceToNow, parseISO } from 'date-fns'
import Vue from 'vue'
import { camelToKebab, slugify } from '~/lib/util'

import { enUS, de } from 'date-fns/locale'
const locales = { en: enUS, de: de }

export default Vue.extend({
  inheritAttrs: false,
  props: {
    mode: {
      type: String,
    },
    map: {
      type: String,
    },
    id: {
      type: [String, Number],
    },
    timestamp: {
      type: String,
    },
    season: {
      type: String,
    },
    link: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    lastOnlineString(): string {
      if (this.timestamp == undefined) {
        return ''
      }
      const date = parseISO(this.timestamp)
      if (differenceInMinutes(new Date(), date) < 60) {
        return this.$tc('state.event-active')
      }
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: locales[this.$i18n.locale],
      })
    },
    linkTarget(): string {
      if (this.mode == undefined) {
        return '/tier-list/brawler'
      }

      if (this.map == undefined) {
        return `/tier-list/mode/${camelToKebab(this.mode)}`
      }

      return `/tier-list/mode/${camelToKebab(this.mode)}/map/${slugify(this.map)}`
    },
  },
})
</script>

<style lang="postcss" scoped>
.stat {
  @apply mx-2 mt-2;
}
</style>
