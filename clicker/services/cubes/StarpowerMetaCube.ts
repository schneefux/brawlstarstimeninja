import BrawlerBattleCube, { BrawlerBattleCubeRow } from "./BrawlerBattleCube";
import { stripIndent } from "common-tags";
import { QueryBuilder } from "knex";
import { DataType } from "./Cube";

export interface StarpowerMetaCubeRow extends BrawlerBattleCubeRow {
  brawler_starpower_id: number
  brawler_starpower_name: string
}

export default class StarpowerMetaCube extends BrawlerBattleCube {
  table = 'brawltime.starpower_meta'
  engineDefinition = stripIndent`
    ENGINE = SummingMergeTree()
    PARTITION BY trophy_season_end
    PRIMARY KEY (brawler_trophyrange)
    ORDER BY (brawler_trophyrange, brawler_id, brawler_name, brawler_starpower_id, brawler_starpower_name)
  `

  dimensions = {
    ...BrawlerBattleCube.defaultDimensions,
    'brawler_starpower_id': 'brawler_starpower_id',
    'brawler_starpower_name': 'brawler_starpower_name',
  }
  dimensionsDefinition = stripIndent`
    trophy_season_end DateTime,
    brawler_trophyrange UInt8,
    brawler_id UInt32,
    brawler_name LowCardinality(String),
    brawler_starpower_id UInt32,
    brawler_starpower_name LowCardinality(String)
  `

  measures = {
    ...BrawlerBattleCube.defaultMeasures,
    'brawler_starpower_name': 'any(brawler_starpower_name)',
  }

  seedQuery = stripIndent`
    SELECT
      trophy_season_end,
      brawler_trophyrange,
      brawler_id,
      brawler_name,
      brawler_starpower_id,
      brawler_starpower_name,
      ${this.measuresQuery}
    FROM brawltime.battle
    WHERE brawler_starpowers_length <= 1
    GROUP BY trophy_season_end, brawler_trophyrange, brawler_id, brawler_name, brawler_starpower_id, brawler_starpower_name
  `

  slices = {
    'with_starpower': 1,
    ...BrawlerBattleCube.defaultSlices,
  }

  slice(query: QueryBuilder, name: string, args: string[]) {
    switch (name) {
      case 'with_starpower':
        return query.where(`${this.table}.brawler_starpower_id`, args[0] == 'true' ? '<>' : '=', '0')
    }
    return super.slice(query, name, args)
  }

  mappers = {
    ...BrawlerBattleCube.mappers,
    brawler_starpower_id: 'int',
    brawler_starpower_name: 'string',
  } as Record<string, DataType>
}
