<template>
  <card
    title="Brawler Personality Test"
    md
    secondary
   >
    <div
      slot="content"
      :class="['relative', {
        'h-24': !showFullDescription,
      }]"
    >
      <template v-if="step == 0">
        <p class="question">
          What is your favorite color?
        </p>
        <div class="answers">
          <button
            v-for="(clss, color) in colors"
            :key="color"
            class="w-8 h-8 mx-1 border-2 rounded border-black"
            :class="clss"
            @click="setColor(color)"
          ></button>
        </div>
      </template>

      <template v-if="step == 1">
        <p class="question">
          Do you always play the new Brawler?
        </p>
        <div class="answers">
          <b-button
            v-for="rating in [5, 3, 1]"
            :key="rating"
            class="mx-2 w-1/3"
            primary
            md
            @click="setOpenness(rating)"
          >
            <template v-if="rating == 5">
              Yes!
            </template>
            <template v-if="rating == 3">
              Sometimes.
            </template>
            <template v-if="rating == 1">
              No.
            </template>
          </b-button>
        </div>
      </template>

      <template v-if="step == 2">
        <p class="question">
          Are you an Attacker or a Defender?
        </p>
        <div class="answers">
          <b-button
            v-for="rating in [5, 3, 1]"
            :key="rating"
            class="mx-2 w-1/3"
            primary
            md
            @click="setExtraversion(rating)"
          >
            <template v-if="rating == 5">
              Attacker!
            </template>
            <template v-if="rating == 3">
              Both!
            </template>
            <template v-if="rating == 1">
              Defender!
            </template>
          </b-button>
        </div>
      </template>

      <template v-if="step == 3">
        <p class="question">
          Are you very upset when you lose?
        </p>
        <div class="answers">
          <b-button
            v-for="rating in [5, 3, 1]"
            :key="rating"
            class="mx-2 w-1/3"
            primary
            md
            @click="setNeurotic(rating)"
          >
            <template v-if="rating == 5">
              Yes!
            </template>
            <template v-if="rating == 3">
              Sometimes.
            </template>
            <template v-if="rating == 1">
              No.
            </template>
          </b-button>
        </div>
      </template>

      <template v-if="step == 4">
        <p>
          Processing profile statistics and answers...
        </p>
        <div class="spinner mt-1 mx-auto">
          <div class="double-bounce1"></div>
          <div class="double-bounce2"></div>
        </div>
      </template>

      <div
        v-if="step == 5 && !showFullDescription"
        class="flex flex-wrap h-full items-center"
      >
        <div class="absolute top-0 right-0 -mt-10 w-1/3 h-full flex flex-wrap justify-end pointer-events-none">
          <media-img
            :path="'/brawlers/' + brawlerId({ name: result }) + '/model'"
            size="256"
            clazz="h-24 mt-3 mr-2"
          ></media-img>
          <div class="w-full flex h-6 justify-end">
            <b-button
              v-if="supportsShareApi"
              class="mr-1 pointer-events-auto"
              primary
              xs
              @click="share"
            >
              Share
            </b-button>
            <b-button
              class="mr-1 pointer-events-auto"
              primary
              xs
              @click="restart"
            >
              Restart
            </b-button>
          </div>
        </div>
        <p
          class="relative w-full text-4xl text-center font-bold text-shadow"
          :class="{
            'mb-8': description.length == 0,
            '-mt-2': description.length > 0,
          }"
        >
          {{ result }}
        </p>
        <p
          v-if="description.length > 0"
          class="w-10/12"
        >
          {{ description[0] }}
          <button
            class="underline"
            @click="showFullDescription = true"
          >More...</button>
        </p>
      </div>
      <div v-if="step == 5 && showFullDescription">
        <p class="w-full text-4xl text-center font-bold text-shadow">
          {{ result }}
        </p>
        <div class="flex mt-2 items-center">
          <p>
            {{ description.join(' ') }}
          </p>
          <div class="ml-2 flex flex-col justify-center">
            <media-img
              :path="'/brawlers/' + brawlerId({ name: result }) + '/model'"
              size="256"
            ></media-img>
          </div>
        </div>
        <div class="flex mt-3 justify-center">
          <b-button
            class="mx-1"
            primary
            @click="restart"
          >
            Restart
          </b-button>
          <b-button
            v-if="supportsShareApi"
            class="mx-1"
            primary
            @click="share"
          >
            Share
          </b-button>
        </div>
      </div>

      <div
        v-if="step < 4"
        class="-mb-4 h-8 w-full flex justify-center items-center"
      >
        <button
          v-for="i in [0, 1, 2, 3]"
          :key="i"
          class="w-4 h-4 mx-1"
          @click="i < step ? step = i : undefined"
        >
          <div
            class="rounded-full"
            :class="{
              'w-2 h-2 mx-1': step != i,
              'w-4 h-4 bg-gray-300': step == i,
              'bg-green-300': step > i,
              'bg-gray-100': step < i,
            }"
          ></div>
        </button>
      </div>
    </div>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState, mapMutations } from 'vuex'
import { Player } from '@/model/Api'
import { brawlerId } from '@/lib/util'

type Color = 'optimism'|'friendly'|'excitement'|'creative'|'trust'|'peaceful'|'balance'

interface Trait {
  name: string
  color: Color
  // [1, 5] = rarity (or depending on trophy road %)
  difficulty: number
  // each [-2, 2]
  open: number
  conscientious: number
  extravert: number
  agreeable: number
  neurotic: number
}

/**
 * Calculate the cosine similarity between two traits.
 */
function similarity(t1: Trait, t2: Trait) {
  const colorMatches = t1.color == t2.color
  const sqr = (n: number) => Math.pow(n, 2)
  // weight difficulty more than the other attributes
  // so players are more likely
  // to get a personality at their skill level
  const difficultyWeight = 2
  const sum1 = sqr(colorMatches ? 5 : 1) +
    sqr(t1.difficulty * difficultyWeight) +
    sqr(t1.open) +
    sqr(t1.conscientious) +
    sqr(t1.extravert) +
    sqr(t1.agreeable) +
    sqr(t1.neurotic)
  const sum2 = sqr(colorMatches ? 5 : 1) +
    sqr(t2.difficulty * difficultyWeight) +
    sqr(t2.open) +
    sqr(t2.conscientious) +
    sqr(t2.extravert) +
    sqr(t2.agreeable) +
    sqr(t2.neurotic)
  const dotProduct =
    (colorMatches ? 5 * 5 : 1) +
    t1.difficulty * difficultyWeight * t2.difficulty * difficultyWeight +
    t1.open * t2.open +
    t1.conscientious * t2.conscientious +
    t1.extravert * t2.extravert +
    t1.agreeable * t2.agreeable +
    t1.neurotic * t2.neurotic
  return dotProduct / (Math.sqrt(sum1) * Math.sqrt(sum2))
}

function closestBrawler(t: Trait) {
  return brawlerTraits
    .sort((t1, t2) => similarity(t, t2) - similarity(t, t1))
    [0]
}

export default Vue.extend({
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
  },
  data() {
    return {
      step: 0,
      userColor: undefined as Color|undefined,
      userOpenness: undefined as number|undefined,
      userExtraversion: undefined as number|undefined,
      userNeuroticism: undefined as number|undefined,
      result: undefined as undefined|string,
      showFullDescription: false,
    }
  },
  created() {
    if (this.personalityTestResult != undefined) {
      this.result = this.personalityTestResult
      this.step = 5
    }
  },
  /*
  // debugging traits:
  created() {
    const occurences = {} as Record<string, number>
    for (const color of ['optimism', 'friendly', 'excitement', 'creative', 'trust', 'peaceful', 'balance']) {
      for (const difficulty of [1, 2, 3, 4, 5]) {
        for (const open of [1, 3, 5]) {
          for (const conscientious of [1, 3, 5]) {
            for (const extravert of [1, 3, 5]) {
              for (const agreeable of [1, 3, 5]) {
                for (const neurotic of [1, 3, 5]) {
                  const t: Trait = {
                    name: 'me',
                    color: color as any,
                    difficulty,
                    conscientious,
                    open,
                    extravert,
                    agreeable,
                    neurotic,
                  }
                  const order = brawlerTraits
                    .map(b => ({
                      name: b.name,
                      sim: similarity(b, t),
                    }))
                    .sort((b1, b2) => b2.sim - b1.sim)
                  if (order[0].sim == order[1].sim) {
                    console.log('collision detected', t, order[0], order[1])
                  }
                  occurences[order[0].name] = (occurences[order[0].name] || 0) + 1
                }
              }
            }
          }
        }
      }
    }
    console.log(occurences)
    brawlerTraits.forEach(t1 => {
      if (!(t1.name in occurences)) {
        throw new Error('Missing brawler: ' + t1.name)
      }
      const dupe = brawlerTraits.find(t2 => t1 != t2 && similarity(t1, t2) == 1)
      if (dupe != undefined) {
        throw new Error('Found duplicate: ' + t1.name + ' ' + dupe.name)
      }
    })
  },
  */
  computed: {
    colors(): Record<Color, string> {
      return {
        'optimism': 'bg-yellow-500',
        'friendly': 'bg-orange-500',
        'excitement': 'bg-red-500',
        'creative': 'bg-purple-500',
        'trust': 'bg-blue-500',
        'peaceful': 'bg-green-500',
        'balance': 'bg-white',
      }
    },
    userTrait(): Trait {
      /*
        https://bigthink.com/mind-brain/color-personality-psychology
        yellow: optimism
        orange: friendly
        red: excitement
        purple: creative
        blue: trust
        green: peaceful
        white: balance
      */
      /*
        https://en.wikipedia.org/wiki/Big_Five_personality_traits
        openness
        conscientiousness
        extraversion
        agreeableness
        neuroticism
      */

      // color personality = ask
      // difficulty = trophies
      // openness = curious for new brawler?
      // conscientiousness = brawlers pushed equally
      // extraversion = attack or defense?
      // agreeableness = 3v3 or solo
      // neuroticism = nervous player?
      const trophyCeiling = 8000 // last Brawler unlock
      const difficulty = 1 + 4 * Math.min(trophyCeiling, this.player.highestTrophies) / trophyCeiling
      const brawlers = Object.values(this.player.brawlers)
      // calculate coefficient of variation for brawler trophies
      const brawlerTrophyAvg = brawlers.reduce((sum, b) => sum + b.highestTrophies, 0) / brawlers.length
      const brawlerTrophyStd = Math.sqrt(brawlers.reduce((sum, b) => sum + Math.pow(b.highestTrophies - brawlerTrophyAvg, 2), 0) / brawlers.length)
      const conscientious = 1 + 4 * (1 - brawlerTrophyStd / brawlerTrophyAvg)
      const teamBattles = this.player['3vs3Victories'] * 2 // 50% expected win rate
      const soloBattles = this.player.soloVictories * 10 // 10% expected win rate
      const agreeable = 1 + 4 * teamBattles / (teamBattles + soloBattles)

      return {
        name: 'user',
        color: this.userColor as Color,
        difficulty,
        open: this.userOpenness!,
        conscientious,
        extravert: this.userExtraversion!,
        agreeable,
        neurotic: this.userNeuroticism!,
      }
    },
    description(): string[] {
      if (this.userTrait.color == undefined) {
        return []
      }

      const colorMap = {
        'optimism': ['an optimistic', 'a warm'],
        'friendly': ['a friendly', 'a cheerful', 'a confident'],
        'excitement': ['an exciting'],
        'creative': ['a creative', 'a wise'],
        'trust': ['a trustworthy', 'a strong'],
        'peaceful': ['a peaceful'],
        'balance': ['a balanced', 'a neutral', 'a calm'],
      } as Record<Color, string[]>
      const colorAdjectives = colorMap[this.userTrait.color]
      const colorAdjective = colorAdjectives[Math.floor(Math.random() * colorAdjectives.length)]
      const colorSentence = `You are ${colorAdjective} person.`

      const difficultyMap = {
        1: 'you are a beginner',
        2: 'you are learning',
        3: 'you are improving',
        4: 'you are skilled',
        5: 'you are a pro',
      }
      const difficultyRelative = difficultyMap[this.userTrait.difficulty]
      const difficultySentence = `As a player, ${difficultyRelative}.`

      const conscientiousSentence = this.userTrait.conscientious > 3 ? 'You are disciplined. '
        : this.userTrait.conscientious < 3 ? 'You do what you want. '
        : ''

      const opennessSentence = this.userTrait.open > 3 ? 'New things excite you. '
        : this.userTrait.open < 3 ? 'You stick with what you know.'
        : ''
      const extraversionSentence = this.userTrait.extravert > 3 ? 'When you attack, your team follows.'
        : this.userTrait.extravert < 3 ? '\'Observe and Attack\' is your motto.'
        : ''

      const agreeableMap = {
        1: 'One should not fight you 1v1.',
        2: 'You prefer to play alone.',
        3: 'In a team, you are an all-rounder.',
        4: 'You are a team player.',
        5: 'You enjoy playing with others.',
      }
      const agreeableSentence = agreeableMap[Math.floor(this.userTrait.agreeable)]

      const neuroticSentence = this.userTrait.neurotic > 3 ? 'You think a lot about yourself and your team.'
        : this.userTrait.neurotic < 3 ? 'You are confident about your game performance.'
        : ''

      return [colorSentence, difficultySentence, conscientiousSentence, opennessSentence, extraversionSentence, agreeableSentence, neuroticSentence]
        .filter(s => s.length > 0)
        .sort((s1, s2) => 0.5 - Math.random())
        .slice(0, 5)
    },
    brawlerId() {
      return brawlerId
    },
    supportsShareApi() {
      return 'share' in navigator
    },
    ...mapState({
      personalityTestResult: (state: any) => state.personalityTestResult as string|undefined,
    })
  },
  methods: {
    setColor(c: Color) {
      this.userColor = c
      this.step++
    },
    setOpenness(o: number) {
      this.userOpenness = o
      this.step++
    },
    setExtraversion(e: number) {
      this.userExtraversion = e
      this.step++
    },
    setNeurotic(n: number) {
      this.userNeuroticism = n
      this.step++
      setTimeout(() => {
        const result = closestBrawler(this.userTrait).name
        this.setPersonalityTestResult(result)
        this.result = result
        this.step++
      }, 3000)
    },
    restart() {
      this.step = 0
      this.showFullDescription = false
      this.$gtag.event('click', {
        'event_category': 'quiz',
        'event_label': 'restart',
      })
    },
    async share() {
      // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
      try {
        await navigator.share({
          title: `I am a ${this.result} person!`,
          text: `My Brawler personality is ${this.result}! What's yours?`,
          url: 'https://brawltime.ninja',
        })
        this.$gtag.event('click', {
          'event_category': 'quiz',
          'event_label': 'share',
        })
      } catch (err) {
        console.error(err);
        this.$gtag.event('click', {
          'event_category': 'quiz',
          'event_label': 'share_error',
        })
      }
    },
    ...mapMutations({
      setPersonalityTestResult: 'setPersonalityTestResult',
    })
  },
  watch: {
    personalityTestResult(p: string) {
      this.result = p
      this.step = 5
    },
    step(s: number) {
      this.$gtag.event('step', {
        'event_category': 'quiz',
        'event_label': s.toString(),
        'value': s,
      })
    },
  },
})

const brawlerTraits: Trait[] = [{
  name: '8-Bit',
  color: 'trust',
  difficulty: 5,
  open: 0,
  conscientious: 0,
  extravert: -2,
  agreeable: 2,
  neurotic: 1,
}, {
  name: 'Barley',
  color: 'balance',
  difficulty: 1,
  open: -1,
  conscientious: 0,
  extravert: 1,
  agreeable: -2,
  neurotic: -1,
}, {
  name: 'Bea',
  color: 'excitement',
  difficulty: 3,
  open: 2,
  conscientious: -1,
  extravert: 2,
  agreeable: -1,
  neurotic: -1,
}, {
  name: 'Bibi',
  color: 'optimism',
  difficulty: 3,
  open: 0,
  conscientious: -2,
  extravert: 1,
  agreeable: -2,
  neurotic: 0,
}, {
  name: 'Bo',
  color: 'friendly',
  difficulty: 4,
  open: -1,
  conscientious: -1,
  extravert: -1,
  agreeable: 1,
  neurotic: -1,
}, {
  name: 'Brock',
  color: 'optimism',
  difficulty: 3,
  open: 2,
  conscientious: -2,
  extravert: 2,
  agreeable: -1,
  neurotic: 2,
}, {
  name: 'Bull',
  color: 'trust',
  difficulty: 2,
  open: -1,
  conscientious: 2,
  extravert: 0,
  agreeable: -2,
  neurotic: 0,
}, {
  name: 'Carl',
  color: 'creative',
  difficulty: 2,
  open: 2,
  conscientious: -1,
  extravert: 2,
  agreeable: 1,
  neurotic: 0,
}, {
  name: 'Colt',
  color: 'friendly',
  difficulty: 1,
  open: 0,
  conscientious: -1,
  extravert: 2,
  agreeable: 2,
  neurotic: -1,
}, {
  name: 'Crow',
  color: 'creative',
  difficulty: 5,
  open: 0,
  conscientious: 2,
  extravert: -2,
  agreeable: -1,
  neurotic: 2,
}, {
  name: 'Darryl',
  color: 'friendly',
  difficulty: 2,
  open: 2,
  conscientious: 0,
  extravert: 2,
  agreeable: -1,
  neurotic: 0,
}, {
  name: 'Dynamike',
  color: 'creative',
  difficulty: 4,
  open: 0,
  conscientious: -1,
  extravert: 2,
  agreeable: 1,
  neurotic: -1,
}, {
  name: 'El Primo',
  color: 'peaceful',
  difficulty: 1,
  open: 2,
  conscientious: -1,
  extravert: 2,
  agreeable: 1,
  neurotic: -1,
}, {
  name: 'Emz',
  color: 'creative',
  difficulty: 5,
  open: 0,
  conscientious: 2,
  extravert: 2,
  agreeable: -2,
  neurotic: 2,
}, {
  name: 'Frank',
  color: 'peaceful',
  difficulty: 3,
  open: 0,
  conscientious: -1,
  extravert: -2,
  agreeable: 2,
  neurotic: -1,
}, {
  name: 'Gale',
  color: 'friendly',
  difficulty: 5,
  open: -1,
  conscientious: -1,
  extravert: -2,
  agreeable: -1,
  neurotic: 1,
}, {
  name: 'Gene',
  color: 'friendly',
  difficulty: 4,
  open: 2,
  conscientious: -1,
  extravert: 2,
  agreeable: 2,
  neurotic: -1,
}, {
  name: 'Jacky',
  color: 'optimism',
  difficulty: 2,
  open: 0,
  conscientious: -2,
  extravert: 1,
  agreeable: 1,
  neurotic: 0,
}, {
  name: 'Jessie',
  color: 'optimism',
  difficulty: 3,
  open: 1,
  conscientious: 0,
  extravert: 1,
  agreeable: 2,
  neurotic: 1,
}, {
  name: 'Leon',
  color: 'excitement',
  difficulty: 5,
  open: 2,
  conscientious: 2,
  extravert: 2,
  agreeable: -2,
  neurotic: 2,
}, {
  name: 'Max',
  color: 'excitement',
  difficulty: 4,
  open: 2,
  conscientious: 1,
  extravert: 2,
  agreeable: 2,
  neurotic: 2,
}, {
  name: 'Mortis',
  color: 'balance',
  difficulty: 4,
  open: -1,
  conscientious: 1,
  extravert: -1,
  agreeable: -2,
  neurotic: 2,
}, {
  name: 'Mr. P',
  color: 'peaceful',
  difficulty: 4,
  open: -1,
  conscientious: -2,
  extravert: 1,
  agreeable: -1,
  neurotic: -1,
}, {
  name: 'Nani',
  color: 'optimism',
  difficulty: 3,
  open: 2,
  conscientious: -1,
  extravert: 1,
  agreeable: 1,
  neurotic: 1,
}, {
  name: 'Nita',
  color: 'friendly',
  difficulty: 1,
  open: 2,
  conscientious: -2,
  extravert: 2,
  agreeable: 1,
  neurotic: 2,
}, {
  name: 'Pam',
  color: 'friendly',
  difficulty: 3,
  open: 1,
  conscientious: 0,
  extravert: -1,
  agreeable: 2,
  neurotic: -1,
}, {
  name: 'Penny',
  color: 'creative',
  difficulty: 2,
  open: 0,
  conscientious: 0,
  extravert: 1,
  agreeable: 1,
  neurotic: -1,
}, {
  name: 'Piper',
  color: 'balance',
  difficulty: 3,
  open: 0,
  conscientious: 0,
  extravert: 2,
  agreeable: -2,
  neurotic: 1,
}, {
  name: 'Poco',
  color: 'creative',
  difficulty: 1,
  open: 2,
  conscientious: -1,
  extravert: 2,
  agreeable: 2,
  neurotic: -1,
}, {
  name: 'Rico',
  color: 'trust',
  difficulty: 2,
  open: -2,
  conscientious: 0,
  extravert: 1,
  agreeable: 2,
  neurotic: 1,
}, {
  name: 'Sandy',
  color: 'peaceful',
  difficulty: 5,
  open: -2,
  conscientious: 0,
  extravert: -2,
  agreeable: 2,
  neurotic: 0,
}, {
  name: 'Shelly',
  color: 'excitement',
  difficulty: 1,
  open: -2,
  conscientious: -1,
  extravert: 1,
  agreeable: -2,
  neurotic: -1,
}, {
  name: 'Spike',
  color: 'friendly',
  difficulty: 5,
  open: 0,
  conscientious: -2,
  extravert: -2,
  agreeable: 1,
  neurotic: -2,
}, {
  name: 'Sprout',
  color: 'optimism',
  difficulty: 4,
  open: 1,
  conscientious: -2,
  extravert: 1,
  agreeable: 2,
  neurotic: -1,
}, {
  name: 'Surge',
  color: 'peaceful',
  difficulty: 5,
  open: 1,
  conscientious: -2,
  extravert: 2,
  agreeable: 1,
  neurotic: -1,
}, {
  name: 'Tara',
  color: 'creative',
  difficulty: 4,
  open: 0,
  conscientious: 0,
  extravert: -2,
  agreeable: 2,
  neurotic: -1,
}, {
  name: 'Tick',
  color: 'peaceful',
  difficulty: 4,
  open: -2,
  conscientious: 0,
  extravert: -2,
  agreeable: 2,
  neurotic: 0,
}]

// name: 'Colette' ???

// rescale all attributes [1, 5]
brawlerTraits.forEach(b => {
  b.open += 3
  b.conscientious += 3
  b.extravert += 3
  b.agreeable += 3
  b.neurotic += 3
})
</script>

<style scoped lang="postcss">
.question {
  @apply font-semibold text-center;
}

.answers {
  @apply mt-3 flex justify-center;
}

/* https://tobiasahlin.com/spinkit/ */
.spinner {
  @apply w-12 h-12 relative;
}

.double-bounce1, .double-bounce2 {
  @apply w-full h-full rounded-full absolute top-0 left-0 bg-yellow-400 opacity-50;
  animation: bounce 2.0s infinite ease-in-out;
}

.double-bounce2 {
  animation-delay: -1.0s;
}

@keyframes bounce {
  0%, 100% {
    transform: scale(0.0);
  } 50% {
    transform: scale(1.0);
  }
}
</style>
