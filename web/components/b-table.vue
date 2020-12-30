<template>
  <div class="flex flex-col">
    <table class="w-full">
      <thead>
        <tr class="h-8 border-b border-gray-600">
          <th
            v-if="ranked"
            scope="col"
            class="text-right pr-2"
          >
            #
          </th>
          <th
            v-for="(c, index) in columns"
            :key="c.key"
            :class="['text-left', {
              'pr-1': index != columns.length - 1,
            }]"
            scope="col"
          >
            {{ c.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="pageRows.length == 0">
          <td
            :colspan="(ranked ? 1 : 0) + columns.length"
            class="text-center"
          >
            No data
          </td>
        </tr>
        <tr
          v-for="r in pageRows"
          :key="r[idKey]"
        >
          <td
            v-if="ranked"
            scope="row"
            class="text-right pr-2 pt-1"
          >
            <slot
              name="index"
              :index="r.index + 1"
              :row="r"
            >
              {{ r.index + 1 }}
            </slot>
          </td>
          <td
            v-for="(c, index) in columns"
            :key="c.key"
            :class="['text-left pt-1', {
              'pr-1': index != columns.length - 1,
            }]"
          >
            <slot
              :name="c.key"
              :row="r"
            >
              {{ c.key.split('.').reduce((a, b) => a[b], r) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <paginator
      v-if="pageSize != undefined"
      v-model="page"
      :pages="Math.floor(rows.length / pageSize)"
      class="pt-2 mt-auto"
    ></paginator>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export interface Column {
  title: string
  key: string
}

export default Vue.extend({
  props: {
    columns: {
      type: Array as PropType<Column[]>,
      required: true
    },
    idKey: {
      type: String,
      required: true
    },
    rows: {
      type: Array as PropType<object[]>,
      required: true
    },
    pageSize: {
      type: Number
    },
    ranked: {
      type: Boolean
    },
  },
  watch: {
    columns() {
      this.page = 0
    },
    rows() {
      this.page = 0
    },
  },
  data() {
    return {
      page: 0,
    }
  },
  computed: {
    pageRows(): object[] {
      const offset = this.page * (this.pageSize || 0)
      const pageRows = this.pageSize == undefined ? this.rows : this.rows.slice(offset, (this.page+1)*this.pageSize)
      return pageRows.map((r, index) => ({
        ...r,
        index: offset + index,
      }))
    },
  },
})
</script>
