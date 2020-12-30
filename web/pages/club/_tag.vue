<template>
  <page>
    <card
      :title="club.name"
      class="mx-auto"
      lg
    >
      <template v-slot:content>
        <blockquote class="mt-2 italic">
          {{ club.description }}
        </blockquote>

        <table class="mt-2 w-full">
          <thead>
            <tr class="h-8 border-b border-gray-600 text-left">
              <th scope="col">
                Name
              </th>
              <th scope="col">
                Role
              </th>
              <th scope="col">
                Trophies
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="member in club.members"
              :key="member.tag"
              class="pt-1"
            >
              <th scope="row" class="pr-2 text-left">
                <router-link
                  :to="`/player/${member.tag}`"
                  :title="member.name"
                >
                  <media-img
                    :path="`/avatars/${member.icon.id}`"
                    clazz="h-8 mr-1 inline"
                  ></media-img>
                  <span>{{ member.name }}</span>
                </router-link>
              </th>
              <td>
                {{ capitalize(member.role).replace('VicePresident', 'Vice President') }}
              </td>
              <td class="text-center">
                {{ member.trophies }}
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </card>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaInfo } from 'vue-meta'
import { capitalize } from '@/lib/util'
import { Club } from '@/model/Brawlstars'

export default Vue.extend({
  head(): MetaInfo {
    // TODO
    const description = `${this.club.name} Brawl Stars Club. ${this.club.description}`
    return {
      title: this.club.name,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  middleware: ['cached'],
  data() {
    return {
      club: {} as Club,
    }
  },
  computed: {
    capitalize() {
      return capitalize
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    })
  },
  async asyncData({ $axios, params }) {
    const club = await $axios.$get<Club>(`/api/club/${params.tag}`)

    return {
      club,
    }
  },
  methods: {
    trackScroll(visible, entry, section) {
      if (visible) {
        this.$gtag.event('scroll', {
          'event_category': 'club',
          'event_label': section,
        })
      }
    },
  },
})
</script>
