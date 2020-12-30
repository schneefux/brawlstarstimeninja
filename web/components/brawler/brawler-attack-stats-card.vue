<template>
  <card
    :title="attack == 'main' ? 'Main Attack' : 'Super'"
    full-height
    md
  >
    <template v-slot:content>
      <p>
        <q class="italic">{{ info[attack].description }}</q>
        <template v-if="content != null">
          <br>
          {{ content[attack] || '' }}
        </template>
      </p>
      <kv-table
        :data="table"
        class="mt-3"
      ></kv-table>
    </template>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BrawlerData } from '~/model/Media'
import { BrawlerContent } from '~/model/Web'

export default Vue.extend({
  props: {
    attack: {
      type: String,
      required: true
    },
    info: {
      type: Object as PropType<BrawlerData>,
      required: true
    },
    content: {
      type: Object as PropType<BrawlerContent>,
    },
  },
  computed: {
    table(): string[][] {
      const data: string[][] = []
      if (this.info[this.attack].rechargeTime != null) {
        data.push([ 'Reload Speed', this.info[this.attack].rechargeTime.toString() + 'ms' ])
      }
      if (this.info[this.attack].range != null) {
        data.push([ 'Range', this.info[this.attack].range.toFixed(1) ])
      }
      if (this.info[this.attack].damageCount != null && this.info[this.attack].damageCount > 1) {
        data.push([ 'Projectiles', this.info[this.attack].damageCount.toString() ])
      }
      if (this.info[this.attack].charges != null) {
        data.push([ 'Ammo', this.info[this.attack].charges.toString() ])
      }
      if (this.info[this.attack].spread != null && this.info[this.attack].spread != 0) {
        data.push([ 'Spread', this.info[this.attack].spread + '°' ])
      }
      if (this.info[this.attack].damage != null) {
        data.push([ 'Damage at Level 1', this.info[this.attack].damage.toString() ])
      }
      if (this.info[this.attack].damage != null) {
        data.push([ 'Damage at Level 10', Math.round(this.info[this.attack].damage * 1.4).toString() ])
      }

      return data
    },
  },
})
</script>
