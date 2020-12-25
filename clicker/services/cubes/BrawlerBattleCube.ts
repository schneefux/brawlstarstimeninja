import MaterializedCube from "./MaterializedCube";
import { QueryBuilder } from "knex";
import { stripIndent } from "common-tags";
import { formatClickhouse, getCurrentSeasonEnd } from "../../lib/util";
import { DataType } from "./Cube";

export interface BrawlerBattleCubeMeasures {
  timestamp: string
  picks: number
  picks_weighted: number
  battle_rank: number
  battle_rank1: number
  battle_victory: number
  battle_duration: number
  battle_starplayer: number
  battle_level: number
  battle_trophy_change: number
}

export interface BrawlerBattleCubeDimensions {
  trophy_season_end: string
  brawler_trophyrange: number
  brawler_id: number
  brawler_name: string
}

export interface BrawlerBattleCubeRow extends BrawlerBattleCubeMeasures, BrawlerBattleCubeDimensions {
}

/*
   Win rate z-score calculation:
    n = sample size = picks
    p = average win rate (expectation)
    x = actual wins (observation)

    mu = expected wins
    normal approximation (valid for n>50 and np>5 and n(1-p)>5):
    sigma^2 = np(1-p)

    z-score:
    z = (x - mu) / sigma
      = (x - np) / (sqrt(np(1-p)))
 */

const picks = 'SUM($TABLE.picks)'
const winRate = `toFloat64(avgMerge(battle_victory_state))`
const wins = `${winRate} * ${picks}`
const zN = picks
// cheap approximation
const zP = '((avg(brawler_trophyrange)-5)*(avg(brawler_trophyrange)-5)/100+0.55)'
const zX = wins
const zScoreConditions = `${zN}>=50 and ${zN}*${zP}>5 and ${zN}*(1-${zP})>5`
const zScore = `(${zX}-${zN}*${zP})/SQRT(${zN}*${zP}*(1-${zP}))`

/*
  The average Brawler win rate is p0=55%, it varies by +/- 7.5%p.
  We want to sort into 5 tiers, so we want to be accurate by 1.5%p.
  We'll use a beta distribution to take this a priori into account.
  Estimate the distribution's parameters using R and a 95% confidence interval:
    install.packages("rriskDistributions")
    library(rriskDistributions)
    p <- 0.55
    delta <- 0.075/5
    get.beta.par(p = c(0.025, 0.5, 0.975), q = c(p-delta, p, p+delta))
  -> alpha=1583, beta=1295

  So our a priori distribution is beta(alpha, beta)
  and our a posteriori distribution beta(alpha+wins, beta+losses).
  For a beta distribution, mu = alpha/(alpha+beta)
  so winrate_post = (alpha+winrate*picks)/(alpha+beta+picks)

  Win rate has a high correlation to average trophies,
  so we improve our prior by fitting a regression:
    winrate_pri = (trophies_mean/100-5)^2/100+0.55
  We do not want to run R on the server, so we estimate one of the parameters:
    mu=alpha/(alpha+beta)=winrate_pri
    beta=alpha/winrate_pri-alpha

  Which gives us:
    winrate_post = (1583+winrate*picks)/(1583/((trophies_mean/100-5)^2/100+0.55)+picks)

  see https://stats.stackexchange.com/a/58792
  see https://stats.stackexchange.com/a/47782
*/
const winratePosterior = `(1583+${wins})/(1583/${zP}+${picks})`

/**
 * All Brawler Battle cubes share the same measures and have common dimensions.
 */
export default abstract class BrawlerBattleCube extends MaterializedCube {
  static defaultMeasures = {
    'trophy_season_end': 'formatDateTime(MAX(trophy_season_end), \'%FT%TZ\', \'UTC\')',
    'timestamp': 'formatDateTime(argMaxMerge(timestamp_state), \'%FT%TZ\', \'UTC\')',
    'picks': 'SUM(picks)',
    'picks_weighted': 'SUM(picks_weighted)',
    'battle_rank': 'avgMerge(battle_rank_state)',
    'battle_rank1': 'avgMerge(battle_rank1_state)',
    'battle_victory': 'avgMerge(battle_victory_state)',
    'battle_victory_adj': winratePosterior,
    'wins': `floor(${wins})`,
    'wins_zscore': `if(${zScoreConditions}, ${zScore}, null)`,
    'battle_duration': 'avgMerge(battle_duration_state)',
    'battle_starplayer': 'avgMerge(battle_starplayer_state)',
    'battle_level': 'avgMerge(battle_level_state)',
    'battle_trophy_change': 'avgMerge(battle_trophy_change_state)',
    'brawler_name': 'any(brawler_name)',
  }

  measures = BrawlerBattleCube.defaultMeasures

  static defaultDimensions = {
    'trophy_season_end': 'formatDateTime(trophy_season_end, \'%FT%TZ\', \'UTC\')',
    'brawler_trophyrange': 'brawler_trophyrange',
    'brawler_id': 'brawler_id',
    'brawler_name': 'brawler_name',
  }

  static defaultSlices = {
    'trophy_season_end': 1,
    'trophy_season_end_exact': 1,
    'brawler_trophyrange': 2,
    'brawler_id': 1,
    'brawler_name': 1,
  }

  slices = BrawlerBattleCube.defaultSlices

  slice(query: QueryBuilder, name: string, args: string[]) {
    switch (name) {
      case 'trophy_season_end':
        if (args[0] == 'current') {
          args[0] = formatClickhouse(getCurrentSeasonEnd())
        }
        if (args[0] == 'balance') {
          args[0] = formatClickhouse(this.balanceChangesDate)
        }
        if (args[0] == 'month') {
          const oneMonthAgo = new Date()
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
          args[0] = formatClickhouse(oneMonthAgo)
        }
        return query.where(`${this.table}.trophy_season_end`, '>=', query.client.raw(`toDateTime(?, 'UTC')`, args[0]))
      case 'trophy_season_end_exact':
        return query.where(`${this.table}.trophy_season_end`, '=', query.client.raw(`toDateTime(?, 'UTC')`, args[0]))
      case 'brawler_trophyrange':
        if (args[1] == '10') {
          args[1] = '999'
        }
        return query.whereBetween(`${this.table}.brawler_trophyrange`, [parseInt(args[0]), parseInt(args[1])])
      case 'brawler_name':
        return query.where(`${this.table}.brawler_name`, '=', args[0])
      case 'brawler_id':
        return query.where(`${this.table}.brawler_id`, '=', args[0])
    }
    throw new Error('Unknown slice name: ' + name)
  }

  static mappers = {
    trophy_season_end: 'string',
    brawler_trophyrange: 'int',
    brawler_name: 'string',
    brawler_id: 'int',

    timestamp: 'string',

    picks: 'int',
    picks_weighted: 'int',
    battle_rank: 'float',
    battle_rank1: 'float',
    battle_victory: 'float',
    battle_victory_adj: 'float',
    wins: 'int',
    wins_zscore: 'float',
    battle_duration: 'float',
    battle_starplayer: 'float',
    battle_level: 'float',
    battle_trophy_change: 'float',
  } as Record<string, DataType>

  measuresDefinition = stripIndent`
    timestamp_state AggregateFunction(argMax, DateTime, DateTime),
    picks UInt64,
    picks_weighted UInt64,
    battle_duration_state AggregateFunction(avg, UInt16),
    battle_rank_state AggregateFunction(avg, UInt8),
    battle_rank1_state AggregateFunction(avg, UInt8),
    battle_victory_state AggregateFunction(avg, Decimal32(8)),
    battle_starplayer_state AggregateFunction(avg, UInt8),
    battle_level_state AggregateFunction(avg, UInt16),
    battle_trophy_change_state AggregateFunction(avg, Int8)
  `

  // *state must have same data type as source column
  measuresQuery = stripIndent`
    argMaxState(timestamp, timestamp) as timestamp_state,
    COUNT(*) AS picks,
    SUM(player_brawlers_length) AS picks_weighted,
    avgState(battle_duration) AS battle_duration_state,
    avgState(battle_rank) AS battle_rank_state,
    avgState(brawltime.battle.battle_rank=1) AS battle_rank1_state,
    avgState(battle_victory) AS battle_victory_state,
    avgState(brawler_name=battle_starplayer_brawler_name) AS battle_starplayer_state,
    avgState(battle_level_id) AS battle_level_state,
    avgState(battle_trophy_change) as battle_trophy_change_state
  `

  virtuals = {} as Record<string, string[]>

  mapVirtual(row: Record<string, string>): Record<string, string|number> {
    return {}
  }
}
