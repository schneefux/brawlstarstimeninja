<template>
  <card
    :title="document.title"
    tag="article"
    itemscope
    itemtype="http://schema.org/AnalysisNewsArticle"
    light
    xxl
  >
    <div
      v-if="document.image"
      slot="infobar"
      :style="`background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${image}')`"
      class="h-48 bg-cover bg-center"
      itemprop="thumbnailUrl"
    ></div>
    <span
      slot="preview"
      class="text-gray-400 text-sm"
    >
      {{ date }}
    </span>
    <div slot="content">
      <nuxt-content
        :document="document"
        ref="content"
        itemprop="articleBody"
        class="prose prose-sm sm:prose lg:prose-lg"
      ></nuxt-content>

      <div
        v-show="lightboxOpen"
        class="fixed inset-0 z-50 bg-gray-900 bg-opacity-75"
      >
        <button
          class="absolute top-0 right-0 mr-10 mt-4 text-white text-5xl"
          @click="lightboxOpen = false"
        >
          &times;
        </button>
        <div
          class="h-full flex justify-center items-center"
          @click.self="lightboxOpen = false"
        >
          <img
            class="max-h-full max-w-full"
            :src="lightboxImage"
          >
        </div>
      </div>
    </div>
    <p
      slot="actions"
      v-if="document.author != undefined"
    >
      This guide was written by {{ document.author }}<template v-if="document.attribution != undefined">
        <wrapped-component
          :wrap="document.attributionLink != undefined"
        >
          <a
            slot="wrapper"
            :href="document.attributionLink"
            rel="nofollow"
            class="underline"
          ></a>
          <span>({{ document.attribution }})</span>
        </wrapped-component>
      </template>.
    </p>
  </card>
</template>

<script lang="ts">
import { IContentDocument } from '@nuxt/content/types/content'
import { format, parseISO } from 'date-fns'
import Vue, { PropType } from 'vue'

export default Vue.extend({
  props: {
    title: {
      type: String,
      required: true
    },
    document: {
      type: Object as PropType<IContentDocument>,
      required: true
    },
  },
  data() {
    return {
      lightboxOpen: false,
      lightboxImage: '',
    }
  },
  mounted() {
    const contentElement = this.$refs.content as HTMLElement
    if (contentElement != undefined) {
      contentElement.querySelectorAll('img.lightbox').forEach((img) => {
        img.addEventListener('click', () => {
          this.lightboxImage = (<HTMLImageElement> img).src
          this.lightboxOpen = true
        })
      })
    }
  },
  computed: {
    date(): string {
      return format(parseISO(this.document.createdAt as unknown as string), 'PP')
    },
  },
})
</script>
