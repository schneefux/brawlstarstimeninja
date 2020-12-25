import BrawlerBattleCube, { BrawlerBattleCubeRow } from "./BrawlerBattleCube";
import { stripIndent } from "common-tags";
import { QueryBuilder } from "knex";
import { DataType } from "./Cube";

export interface GadgetMetaCubeRow extends BrawlerBattleCubeRow {
  brawler_gadget_id: number
  brawler_gadget_name: string
}

export default class GadgetMetaCube extends BrawlerBattleCube {
  table = 'brawltime.gadget_meta'
  engineDefinition = stripIndent`
    ENGINE = SummingMergeTree()
    PARTITION BY trophy_season_end
    PRIMARY KEY (brawler_trophyrange)
    ORDER BY (brawler_trophyrange, brawler_id, brawler_name, brawler_gadget_id, brawler_gadget_name)
  `

  dimensions = {
    ...BrawlerBattleCube.defaultDimensions,
    'brawler_gadget_id': 'brawler_gadget_id',
    'brawler_gadget_name': 'brawler_gadget_name',
  }
  dimensionsDefinition = stripIndent`
    trophy_season_end DateTime,
    brawler_trophyrange UInt8,
    brawler_id UInt32,
    brawler_name LowCardinality(String),
    brawler_gadget_id UInt32,
    brawler_gadget_name LowCardinality(String)
  `

  measures = {
    ...BrawlerBattleCube.defaultMeasures,
    'brawler_gadget_name': 'any(brawler_gadget_name)',
  }

  seedQuery = stripIndent`
    SELECT
      trophy_season_end,
      brawler_trophyrange,
      brawler_id,
      brawler_name,
      brawler_gadget_id,
      brawler_gadget_name,
      ${this.measuresQuery}
    FROM brawltime.battle
    WHERE brawler_gadgets_length <= 1
    GROUP BY trophy_season_end, brawler_trophyrange, brawler_id, brawler_name, brawler_gadget_id, brawler_gadget_name
  `

  slices = {
    'with_gadget': 1,
    ...BrawlerBattleCube.defaultSlices,
  }

  slice(query: QueryBuilder, name: string, args: string[]) {
    switch (name) {
      case 'with_gadget':
        return query.where(`${this.table}.brawler_gadget_id`, args[0] == 'true' ? '<>' : '=', '0')
    }
    return super.slice(query, name, args)
  }

  mappers = {
    ...BrawlerBattleCube.mappers,
    brawler_gadget_id: 'int',
    brawler_gadget_name: 'string',
  } as Record<string, DataType>
}
