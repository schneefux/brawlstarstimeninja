import Vue, { PropType } from 'vue'
import { Post } from '~/model/Web'

export default Vue.extend({
  functional: true,
  props: {
    post: {
      type: Object as PropType<Post>,
      required: true,
    },
    brawlerId: {
      type: String,
      required: true
    },
  },
  render(h, { props }) {
    const brawlerId = props.brawlerId
    const post = props.post

    return
  }
})
