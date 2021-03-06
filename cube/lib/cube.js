"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.commonMeasurements = exports.brawlerMeasurements = exports.playerMeasurements = void 0;
// helper function which infers keys and restricts values to ElementType
var asDimensions = function (et) { return et; };
var asMeasurements = function (et) { return et; };
var asSlice = function (et) { return et; };
var metaDimensions = asDimensions({
    season: {
        id: 'season',
        name: 'Bi-Week',
        formatColumn: 'trophy_season_end',
        formatter: '',
        column: 'trophy_season_end',
        anyColumns: [],
        hidden: false,
        type: 'temporal',
        scale: {
            nice: 'week'
        },
        config: {
            sql: 'trophy_season_end',
            type: 'time'
        }
    },
    day: {
        id: 'day',
        name: 'Day',
        formatColumn: 'timestamp_day',
        formatter: 'yyyy-MM-dd',
        column: 'timestamp_day',
        anyColumns: [],
        hidden: false,
        type: 'temporal',
        scale: {
            nice: 'day'
        },
        config: {
            sql: 'timestamp_day',
            type: 'time'
        }
    },
    timestamp: {
        id: 'timestamp',
        name: 'Timestamp',
        formatColumn: 'timestamp',
        formatter: 'yyyy-MM-ddTHH:mm',
        column: 'timestamp',
        anyColumns: [],
        hidden: false,
        type: 'temporal',
        scale: {
            nice: 'hour'
        },
        config: {
            sql: 'timestamp',
            type: 'time'
        }
    }
});
var playerDimensions = asDimensions({
    player: {
        id: 'player',
        name: 'Player',
        formatColumn: 'player_name',
        formatter: '',
        column: 'player_id',
        anyColumns: ['player_name', /* 'player_tag', FIXME */ 'player_icon_id'],
        hidden: false,
        type: 'nominal',
        config: {
            sql: 'player_id',
            type: 'string'
        }
    }
});
var brawlerDimensions = asDimensions({
    brawler: {
        id: 'brawler',
        name: 'Brawler',
        formatColumn: 'brawler_name',
        formatter: 'capitalizeWords',
        column: 'brawler_name',
        anyColumns: [],
        hidden: false,
        type: 'nominal',
        config: {
            sql: 'brawler_name',
            type: 'string'
        }
    },
    brawlerId: {
        id: 'brawlerId',
        name: 'Brawler ID',
        formatColumn: 'brawler_id',
        formatter: '',
        column: 'brawler_id',
        anyColumns: [],
        hidden: true,
        type: 'nominal',
        config: {
            sql: 'brawler_id',
            type: 'string'
        }
    },
    ally: {
        id: 'ally',
        name: 'Ally',
        formatColumn: 'ally_brawler_name',
        formatter: 'capitalizeWords',
        column: 'ally_brawler_name',
        anyColumns: [],
        hidden: false,
        type: 'nominal',
        config: {
            sql: 'ally_brawler_name',
            type: 'string'
        }
    },
    allyId: {
        id: 'allyId',
        name: 'Ally ID',
        formatColumn: 'ally_brawler_id',
        formatter: '',
        column: 'ally_brawler_id',
        anyColumns: [],
        hidden: true,
        type: 'nominal',
        config: {
            sql: 'ally_brawler_id',
            type: 'string'
        }
    },
    gadget: {
        id: 'gadget',
        name: 'Gadget',
        formatColumn: 'brawler_gadget_name',
        formatter: 'capitalizeWords',
        column: 'brawler_gadget_id',
        anyColumns: ['brawler_gadget_name', 'brawler_name'],
        hidden: false,
        type: 'nominal',
        config: {
            sql: 'brawler_gadget_id',
            type: 'string'
        }
    },
    starpower: {
        id: 'starpower',
        name: 'Star Power',
        formatColumn: 'brawler_starpower_name',
        formatter: 'capitalizeWords',
        column: 'brawler_starpower_id',
        anyColumns: ['brawler_starpower_name', 'brawler_name'],
        hidden: false,
        type: 'nominal',
        config: {
            sql: 'brawler_starpower_id',
            type: 'string'
        }
    },
    bigbrawler: {
        id: 'bigbrawler',
        name: 'Big Brawler',
        formatColumn: 'battle_is_bigbrawler',
        formatter: 'y/n',
        column: 'brawler_is_bigbrawler',
        anyColumns: [],
        hidden: true,
        type: 'nominal',
        config: {
            sql: 'battle_is_bigbrawler',
            type: 'boolean'
        }
    }
});
var battleDimensions = asDimensions({
    mode: {
        id: 'mode',
        name: 'Mode',
        formatColumn: 'battle_event_mode',
        formatter: 'formatMode',
        column: 'battle_event_mode',
        anyColumns: [],
        hidden: false,
        type: 'nominal',
        config: {
            sql: 'battle_event_mode',
            type: 'string'
        }
    },
    map: {
        id: 'map',
        name: 'Map',
        formatColumn: 'battle_event_map',
        formatter: '',
        column: 'battle_event_map',
        anyColumns: ['battle_event_mode', 'battle_event_id'],
        hidden: false,
        type: 'nominal',
        config: {
            sql: 'battle_event_map',
            type: 'string'
        }
    },
    team: {
        id: 'team',
        name: 'Team',
        formatColumn: 'brawler_names',
        formatter: 'capitalizeWords',
        column: 'brawler_names',
        anyColumns: [],
        hidden: false,
        type: 'nominal',
        config: {
            sql: 'brawler_names',
            type: 'string'
        }
    },
    powerplay: {
        id: 'powerplay',
        name: 'Power Play',
        formatColumn: 'battle_power_play',
        formatter: 'y/n',
        column: 'battle_power_play',
        anyColumns: [],
        hidden: false,
        type: 'nominal',
        config: {
            sql: 'battle_power_play',
            type: 'boolean'
        }
    }
});
var commonDimensions = asDimensions(__assign(__assign(__assign(__assign({}, playerDimensions), brawlerDimensions), metaDimensions), battleDimensions));
var picks = 'SUM(picks)';
var winRate = "toFloat64(AVG(battle_victory))";
var winRateMerged = "toFloat64(avgMerge(battle_victory_state))";
var zP = '((avg(brawler_trophyrange)-5)*(avg(brawler_trophyrange)-5)/100+0.55)';
var winratePosterior = "(1583+" + winRate + "*" + picks + ")/(1583/" + zP + "+" + picks + ")";
var winratePosteriorMerged = "(1583+" + winRateMerged + "*" + picks + ")/(1583/" + zP + "+" + picks + ")";
exports.playerMeasurements = asMeasurements({
    playerName: {
        id: 'playerName',
        name: 'Most common name',
        nameShort: 'Name',
        icon: '',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        percentage: false,
        column: 'player_name',
        type: 'nominal',
        config: {
            sql: 'any(player_name)',
            type: 'number'
        }
    },
    clubName: {
        id: 'clubName',
        name: 'Most common Club name',
        nameShort: 'Club Name',
        icon: '',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        percentage: false,
        column: 'player_club_name',
        type: 'nominal',
        config: {
            sql: 'any(player_club_name)',
            type: 'number'
        }
    },
    playerIcon: {
        id: 'playerIcon',
        name: 'Most common icon',
        nameShort: 'Icon',
        icon: '',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        percentage: false,
        column: 'player_icon_id',
        type: 'nominal',
        config: {
            sql: 'any(player_icon_id)',
            type: 'number'
        }
    },
    playerNameColor: {
        id: 'playerNameColor',
        name: 'Most common color',
        nameShort: 'Name Color',
        icon: '',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        percentage: false,
        column: 'player_name_color',
        type: 'nominal',
        config: {
            sql: 'any(player_name_color)',
            type: 'number'
        }
    },
    playerTrophies: {
        id: 'playerTrophies',
        name: 'Player Trophies',
        nameShort: 'Trophies',
        icon: '',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        percentage: false,
        column: 'player_trophies',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'player_trophies',
            type: 'max'
        }
    },
    playerHighestTrophies: {
        id: 'playerHighestTrophies',
        name: 'Player Highest Trophies',
        nameShort: 'Trophy Max',
        icon: '',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        percentage: false,
        column: 'player_highest_trophies',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'player_highest_trophies',
            type: 'max'
        }
    },
    victories: {
        id: 'victories',
        name: '3v3 Victories',
        nameShort: 'Victories',
        icon: '',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        percentage: false,
        column: 'player_3vs3_victories',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'player_3vs3_victories',
            type: 'max'
        }
    },
    exp: {
        id: 'exp',
        name: 'Experience',
        nameShort: 'EXP',
        icon: '',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        percentage: false,
        column: 'player_exp_points',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'player_exp',
            type: 'max'
        }
    },
    soloVictories: {
        id: 'soloVictories',
        name: 'Solo Victories',
        nameShort: 'SD Victories',
        icon: '',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        percentage: false,
        column: 'player_solo_victories',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'player_solo_victories',
            type: 'max'
        }
    },
    duoVictories: {
        id: 'duoVictories',
        name: 'Duo Victories',
        nameShort: 'SD Victories',
        icon: '',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        percentage: false,
        column: 'player_duo_victories',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'player_duo_victories',
            type: 'max'
        }
    },
    users: {
        id: 'users',
        name: 'Players',
        nameShort: 'Players',
        icon: '🧑',
        description: 'The total number of players.',
        formatter: '.1s',
        d3formatter: '.1s',
        sign: -1,
        percentage: false,
        column: 'users',
        type: 'quantitative',
        config: {
            sql: 'uniqCombined(player_id)',
            type: 'number'
        }
    },
    powerPlayPoints: {
        id: 'powerPlayPoints',
        name: 'Power Play Points',
        nameShort: 'Points',
        icon: '',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        percentage: false,
        column: 'player_power_play_points',
        type: 'quantitative',
        config: {
            sql: 'player_power_play_points',
            type: 'max'
        }
    },
    highestPowerPlayPoints: {
        id: 'highestPowerPlayPoints',
        name: 'Highest Power Play Points',
        nameShort: 'Points Max',
        icon: '',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        percentage: false,
        column: 'player_highest_power_play_points',
        type: 'quantitative',
        config: {
            sql: 'player_highest_power_play_points',
            type: 'max'
        }
    },
    expLevel: {
        id: 'expLevel',
        name: 'EXP Level',
        nameShort: 'EXP',
        icon: '',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        percentage: false,
        column: 'player_exp_level',
        type: 'quantitative',
        config: {
            sql: 'player_exp_level',
            type: 'max'
        }
    },
    expPoints: {
        id: 'expPoints',
        name: 'EXP',
        nameShort: 'EXP',
        icon: '',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        percentage: false,
        column: 'player_exp_points',
        type: 'quantitative',
        config: {
            sql: 'player_exp_points',
            type: 'max'
        }
    },
    brawlers: {
        id: 'brawlers',
        name: 'Brawlers',
        nameShort: 'Brawlers',
        icon: '',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        percentage: false,
        column: 'player_brawlers_length',
        type: 'quantitative',
        config: {
            sql: 'player_brawlers_length',
            type: 'max'
        }
    }
});
exports.brawlerMeasurements = asMeasurements({
    highestTrophies: {
        id: 'highestTrophies',
        name: 'Highest Trophies',
        nameShort: 'Highest Trophies',
        icon: '',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        percentage: false,
        column: 'brawler_highest_trophies',
        type: 'quantitative',
        config: {
            sql: 'brawler_highest_trophies',
            type: 'max'
        }
    },
    trophies: {
        id: 'trophies',
        name: 'Trophies',
        nameShort: 'Trophies',
        icon: 'trophy',
        description: 'The amount of Trophies tells you how many trophies players have with this Brawler on average.',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        percentage: false,
        column: 'brawler_trophies',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'brawler_trophies',
            type: 'avg'
        }
    },
    brawler: {
        id: 'brawler',
        name: 'Most played Brawler',
        nameShort: 'Brawler',
        icon: '',
        description: '',
        formatter: 'capitalizeWords',
        d3formatter: '',
        sign: -1,
        percentage: false,
        column: 'brawler_name',
        type: 'nominal',
        config: {
            sql: 'anyHeavy(brawler_name)',
            type: 'number'
        }
    },
    starpowers: {
        id: 'starpowers',
        name: 'Star Powers',
        nameShort: 'Star Powers',
        icon: '',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        percentage: false,
        column: 'brawler_starpowers_length',
        type: 'quantitative',
        config: {
            sql: 'brawler_starpowers_length',
            type: 'max'
        }
    },
    gadgets: {
        id: 'gadgets',
        name: 'Gadgets',
        nameShort: 'Gadgets',
        icon: '',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        percentage: false,
        column: 'brawler_gadgets_length',
        type: 'quantitative',
        config: {
            sql: 'brawler_gadgets_length',
            type: 'max'
        }
    }
});
var metaMeasurements = asMeasurements({
    timestamp: {
        // TODO
        id: 'timestamp',
        name: 'Last Update',
        nameShort: 'Updated',
        icon: '⌚',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        percentage: false,
        column: 'timestamp',
        type: 'temporal',
        config: {
            sql: 'formatDateTime(MAX(timestamp), \'%FT%TZ\', \'UTC\')',
            type: 'number'
        }
    },
    day: {
        // TODO
        id: 'day',
        name: 'Day',
        nameShort: 'Day',
        icon: '⌚',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        percentage: false,
        column: 'timestamp_day',
        type: 'temporal',
        config: {
            sql: 'formatDateTime(MAX(toStartOfDay(timestamp)), \'%FT%TZ\', \'UTC\')',
            type: 'number'
        }
    }
});
var battleMeasurements = asMeasurements({
    trophyChange: {
        id: 'trophyChange',
        name: 'Trophy Change',
        nameShort: 'TrophyD',
        icon: 'trophy',
        description: '',
        formatter: '+.2f',
        d3formatter: '+.2f',
        sign: -1,
        percentage: false,
        column: 'battle_trophy_change',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'battle_trophy_change',
            type: 'avg'
        }
    },
    winRate: {
        id: 'winRate',
        name: 'Win Rate',
        nameShort: 'Win',
        icon: '📈',
        description: 'The Win Rate tells you the % of battles a Brawler wins or ranks high.',
        formatter: '.1%',
        d3formatter: '.1%',
        sign: -1,
        percentage: false,
        column: 'battle_victory',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'battle_victory',
            type: 'avg'
        }
    },
    winRateAdj: {
        id: 'winRateAdj',
        name: 'Adjusted Win Rate',
        nameShort: 'Win',
        icon: '📈',
        description: 'The Adjusted Win Rate tells you the % of battles a Brawler wins or ranks high. For Brawlers with few picks, this value is interpolated.',
        formatter: '.1%',
        d3formatter: '.1%',
        sign: -1,
        percentage: false,
        column: 'battle_victory_adj',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: winratePosterior,
            type: 'number'
        }
    },
    winRateDiff: {
        id: 'winRateDiff',
        name: 'Win Rate Diff',
        nameShort: 'WinD',
        icon: '📈',
        description: 'The Win Rate Difference compares the Win Rate of Brawlers with a Star Power / Gadget to those without.',
        formatter: '+.2%',
        d3formatter: '+.2%',
        sign: -1,
        percentage: false,
        column: 'battle_victory',
        type: 'quantitative',
        config: {
            sql: '',
            type: 'number'
        }
    },
    wins: {
        id: 'wins',
        name: 'Wins',
        nameShort: 'Wins',
        icon: '📈',
        description: 'The number of Wins recorded ranks Brawlers high who are played a lot and win a lot.',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        percentage: false,
        column: 'wins',
        type: 'quantitative',
        config: {
            sql: 'battle_victory',
            type: 'sum'
        }
    },
    winsZScore: {
        id: 'winsZScore',
        name: 'Wins z-Score',
        nameShort: 'Win-z',
        icon: '📈',
        description: 'The Wins z-score uses a statistical test to compare the wins of Brawlers with a Star Power / Gadget to those without. Scores higher/lower than 2 are good/bad.',
        formatter: '.2f',
        d3formatter: '.2f',
        sign: -1,
        percentage: false,
        column: 'wins',
        type: 'quantitative',
        config: {
            sql: '',
            type: 'number'
        }
    },
    picks: {
        id: 'picks',
        name: 'Picks recorded',
        nameShort: 'Picks',
        icon: '👇',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        percentage: false,
        column: 'picks',
        type: 'quantitative',
        config: {
            sql: '',
            type: 'count'
        }
    },
    pickRate: {
        id: 'pickRate',
        name: 'Pick Rate',
        nameShort: 'Picked',
        icon: '👇',
        description: 'The Pick Rate tells you the % of battles this Brawler appears in.',
        formatter: '.2%',
        d3formatter: '.2%',
        sign: -1,
        percentage: true,
        column: 'picks',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: '',
            type: 'count'
        }
    },
    useRate: {
        id: 'useRate',
        name: 'Use Rate',
        nameShort: 'Used',
        icon: '🎯',
        description: 'The Use Rate measures the popularity of a Brawler, adjusted to how many players unlocked them. It is the main statistic Supercell uses to balance Brawlers.',
        formatter: '.2%',
        d3formatter: '.2%',
        sign: -1,
        percentage: true,
        column: 'picks_weighted',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'player_brawlers_length',
            type: 'sum'
        }
    },
    starRate: {
        id: 'starRate',
        name: 'Star Player',
        nameShort: 'Star',
        icon: '⭐',
        description: 'The Star Rate tells you the % of battles this Brawler becomes Star Player.',
        formatter: '.1%',
        d3formatter: '.1%',
        sign: -1,
        percentage: false,
        column: 'battle_starplayer',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'player_brawlers_length',
            type: 'sum'
        }
    },
    starRateDiff: {
        id: 'starRateDiff',
        name: 'Star Player Diff.',
        nameShort: 'StarD',
        icon: '⭐',
        description: 'The Star Rate Difference compares the Star Rate of Brawlers with a Star Power / Gadget to those without.',
        formatter: '+.2%',
        d3formatter: '+.2%',
        sign: -1,
        percentage: false,
        column: 'battle_starplayer',
        type: 'quantitative',
        config: {
            sql: '',
            type: 'number'
        }
    },
    rank: {
        id: 'rank',
        name: 'Average Rank',
        nameShort: 'Rank',
        icon: 'leaderboards',
        description: 'The Average Rank tells you what place the Brawler is ranked in Showdown on average.',
        formatter: '.2f',
        d3formatter: '.2f',
        sign: +1,
        percentage: false,
        column: 'battle_rank',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'battle_rank',
            type: 'avg'
        }
    },
    rank1: {
        id: 'rank1',
        name: '#1 Recorded',
        nameShort: 'Rank 1',
        icon: '🏅',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        percentage: false,
        column: 'battle_rank1',
        type: 'quantitative',
        config: {
            sql: 'battle_rank1',
            type: 'sum'
        }
    },
    rank1Rate: {
        id: 'rank1Rate',
        name: '#1 Rate',
        nameShort: 'SD Win',
        icon: '📈',
        description: 'The #1 Rate tells you the % of Showdown battles a Brawler is #1.',
        formatter: '.2%',
        d3formatter: '.2%',
        sign: -1,
        percentage: false,
        column: 'battle_rank1',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'battle_rank1',
            type: 'avg'
        }
    },
    rank1RateDiff: {
        id: 'rank1RateDiff',
        name: '#1 Rate Diff.',
        nameShort: 'SD WinD',
        icon: '📈',
        description: 'The #1 Rate Difference compares the #1 Rate of Brawlers with a Star Power / Gadget to those without.',
        formatter: '+.2%',
        d3formatter: '+.2%',
        sign: -1,
        percentage: false,
        column: 'battle_rank1',
        type: 'quantitative',
        config: {
            sql: '',
            type: 'number'
        }
    },
    duration: {
        id: 'duration',
        name: 'Duration',
        nameShort: 'Duration',
        icon: '⏰',
        description: 'The Duration tells you how long battles with this Brawler last on average in seconds.',
        formatter: 'duration',
        d3formatter: 'duration',
        sign: +1,
        percentage: false,
        column: 'battle_duration',
        type: 'quantitative',
        config: {
            sql: 'battle_duration',
            type: 'avg'
        }
    },
    level: {
        id: 'level',
        name: 'Average Level',
        nameShort: 'Level',
        icon: '🏅',
        description: '',
        formatter: '.2f',
        d3formatter: '.2f',
        sign: -1,
        percentage: false,
        column: 'battle_level',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'battle_level',
            type: 'avg'
        }
    },
    power: {
        id: 'power',
        name: 'Power',
        nameShort: 'Power',
        icon: '🏅',
        description: '',
        formatter: '.2f',
        d3formatter: '.2f',
        sign: -1,
        percentage: false,
        column: 'brawler_power',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'brawler_power',
            type: 'avg'
        }
    }
});
// same as battleMeasurements, but using clickhouse merge for mv
var mergedbattleMeasurements = asMeasurements({
    trophyChange: {
        id: 'trophyChange',
        name: 'Trophy Change',
        nameShort: 'TrophyD',
        icon: 'trophy',
        description: '',
        formatter: '+.2f',
        d3formatter: '+.2f',
        sign: -1,
        percentage: false,
        column: 'battle_trophy_change',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'avgMerge(battle_trophy_change_state)',
            type: 'number'
        }
    },
    winRate: {
        id: 'winRate',
        name: 'Win Rate',
        nameShort: 'Win',
        icon: '📈',
        description: 'The Win Rate tells you the % of battles a Brawler wins or ranks high.',
        formatter: '.1%',
        d3formatter: '.1%',
        sign: -1,
        percentage: false,
        column: 'battle_victory',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'avgMerge(battle_victory_state)',
            type: 'number'
        }
    },
    winRateAdj: {
        id: 'winRateAdj',
        name: 'Adjusted Win Rate',
        nameShort: 'Win',
        icon: '📈',
        description: 'The Adjusted Win Rate tells you the % of battles a Brawler wins or ranks high. For Brawlers with few picks, this value is interpolated.',
        formatter: '.1%',
        d3formatter: '.1%',
        sign: -1,
        percentage: false,
        column: 'battle_victory_adj',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: winratePosteriorMerged,
            type: 'number'
        }
    },
    wins: {
        id: 'wins',
        name: 'Wins',
        nameShort: 'Wins',
        icon: '📈',
        description: 'The number of Wins recorded ranks Brawlers high who are played a lot and win a lot.',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        percentage: false,
        column: 'wins',
        type: 'quantitative',
        config: {
            sql: winRateMerged + "*" + picks,
            type: 'number'
        }
    },
    pickRate: {
        id: 'pickRate',
        name: 'Pick Rate',
        nameShort: 'Picked',
        icon: '👇',
        description: 'The Pick Rate tells you the % of battles this Brawler appears in.',
        formatter: '.2%',
        d3formatter: '.2%',
        sign: -1,
        percentage: true,
        column: 'picks',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'SUM(picks)',
            type: 'number'
        }
    },
    starRate: {
        id: 'starRate',
        name: 'Star Player',
        nameShort: 'Star',
        icon: '⭐',
        description: 'The Star Rate tells you the % of battles this Brawler becomes Star Player.',
        formatter: '.1%',
        d3formatter: '.1%',
        sign: -1,
        percentage: false,
        column: 'battle_starplayer',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'avgMerge(battle_starplayer_state_state)',
            type: 'sum'
        }
    },
    rank: {
        id: 'rank',
        name: 'Average Rank',
        nameShort: 'Rank',
        icon: 'leaderboards',
        description: 'The Average Rank tells you what place the Brawler is ranked in Showdown on average.',
        formatter: '.2f',
        d3formatter: '.2f',
        sign: +1,
        percentage: false,
        column: 'battle_rank',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'avgMerge(battle_rank_state)',
            type: 'number'
        }
    },
    rank1Rate: {
        id: 'rank1Rate',
        name: '#1 Rate',
        nameShort: 'SD Win',
        icon: '📈',
        description: 'The #1 Rate tells you the % of Showdown battles a Brawler is #1.',
        formatter: '.2%',
        d3formatter: '.2%',
        sign: -1,
        percentage: false,
        column: 'battle_rank1',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'avgMerge(battle_rank1_state)',
            type: 'number'
        }
    },
    duration: {
        id: 'duration',
        name: 'Duration',
        nameShort: 'Duration',
        icon: '⏰',
        description: 'The Duration tells you how long battles with this Brawler last on average in seconds.',
        formatter: 'duration',
        d3formatter: 'duration',
        sign: +1,
        percentage: false,
        column: 'battle_duration',
        type: 'quantitative',
        config: {
            sql: 'avgMerge(battle_duration)',
            type: 'number'
        }
    }
});
exports.commonMeasurements = asMeasurements(__assign(__assign(__assign(__assign({}, metaMeasurements), exports.playerMeasurements), exports.brawlerMeasurements), battleMeasurements));
var metaSlices = asSlice({
    season: {
        id: 'season',
        name: 'Since Time',
        column: 'trophy_season_end'
    },
    seasonExact: {
        id: 'seasonExact',
        name: 'Time',
        column: 'trophy_season_end_exact'
    },
    timestamp: {
        id: 'timestamp',
        name: 'Since Time',
        column: 'timestamp'
    }
});
var playerSlices = asSlice({
    playerName: {
        id: 'playerName',
        name: 'Player Name',
        column: 'player_name_ilike'
    },
    playerId: {
        id: 'playerId',
        name: 'Player ID',
        column: 'player_id'
    },
    playerTag: {
        id: 'playerTag',
        name: 'Player Tag',
        column: 'player_tag'
    }
});
var brawlerSlices = asSlice({
    brawler: {
        id: 'brawler',
        name: 'Brawler',
        column: 'brawler_name'
    },
    brawlerId: {
        id: 'brawlerId',
        name: 'Brawler ID',
        column: 'brawler_id'
    },
    ally: {
        id: 'ally',
        name: 'Ally',
        column: 'ally_brawler_name'
    },
    allyId: {
        id: 'allyId',
        name: 'Ally ID',
        column: 'ally_brawler_id'
    },
    trophies: {
        id: 'trophies',
        name: 'Trophies',
        column: 'brawler_trophyrange'
    },
    withStarpower: {
        id: 'withStarpower',
        name: 'Star Power detected',
        column: 'with_starpower'
    },
    withGadget: {
        id: 'withGadget',
        name: 'Gadget detected',
        column: 'with_gadget'
    }
});
var battleSlices = asSlice({
    mode: {
        id: 'mode',
        name: 'Mode',
        column: 'battle_event_mode'
    },
    map: {
        id: 'map',
        name: 'Map',
        column: 'battle_event_map'
    },
    mapLike: {
        id: 'mapLike',
        name: 'Map Name',
        column: 'battle_event_map_like'
    },
    mapNotLike: {
        id: 'mapNotLike',
        name: 'not Map Name',
        column: 'battle_event_map_notlike'
    },
    powerplay: {
        id: 'powerplay',
        name: 'Power Play',
        column: 'battle_event_powerplay'
    },
    bigbrawler: {
        id: 'bigbrawler',
        name: 'Big Brawler',
        column: 'battle_is_bigbrawler'
    }
});
var commonSlices = asSlice(__assign(__assign(__assign(__assign({}, metaSlices), playerSlices), battleSlices), brawlerSlices));
var brawlerBattleMeasurements = [
    /*
    mergedbattleMeasurements.trophySeasonEnd,
    mergedbattleMeasurements.timestamp,
    */
    mergedbattleMeasurements.trophyChange,
    mergedbattleMeasurements.winRate,
    mergedbattleMeasurements.winRateAdj,
    mergedbattleMeasurements.wins,
    exports.commonMeasurements.picks,
    mergedbattleMeasurements.pickRate,
    exports.commonMeasurements.useRate,
    mergedbattleMeasurements.starRate,
    mergedbattleMeasurements.rank,
    mergedbattleMeasurements.rank1Rate,
    mergedbattleMeasurements.duration,
    exports.commonMeasurements.level,
    exports.commonMeasurements.brawler,
];
var brawlerBattleDimensions = [
    commonDimensions.brawler,
    commonDimensions.season,
];
var brawlerBattleSlices = [
    commonSlices.season,
    commonSlices.seasonExact,
    commonSlices.trophies,
    commonSlices.brawler,
];
var brawlerBattleDefaultSliceValues = {
    season: ['month'],
    trophies: [],
    brawler: []
};
var playerBrawlerDimensions = [
    commonDimensions.season,
    commonDimensions.timestamp,
    commonDimensions.day,
    commonDimensions.player,
    commonDimensions.brawler,
    commonDimensions.brawlerId,
];
var playerBrawlerMeasurements = [
    exports.commonMeasurements.picks,
    exports.commonMeasurements.pickRate,
    exports.commonMeasurements.useRate,
    exports.commonMeasurements.users,
    // commonMeasurements.season,
    exports.commonMeasurements.timestamp,
    exports.commonMeasurements.day,
    exports.commonMeasurements.playerName,
    exports.commonMeasurements.playerNameColor,
    exports.commonMeasurements.playerIcon,
    exports.commonMeasurements.playerTrophies,
    exports.commonMeasurements.playerHighestTrophies,
    exports.commonMeasurements.powerPlayPoints,
    exports.commonMeasurements.highestPowerPlayPoints,
    exports.commonMeasurements.expPoints,
    // commonMeasurements.championshipQualified,
    exports.commonMeasurements.victories,
    exports.commonMeasurements.soloVictories,
    exports.commonMeasurements.duoVictories,
    // commonMeasurements.roboRumble,
    // commonMeasurements.bigBrawler,
    exports.commonMeasurements.brawlers,
    // commonMeasurements.clubId,
    // commonMeasurements.clubTag,
    exports.commonMeasurements.clubName,
    // commonMeasurements.brawlerId,
    exports.commonMeasurements.brawler,
    exports.commonMeasurements.power,
    exports.commonMeasurements.trophies,
    exports.commonMeasurements.highestTrophies,
    exports.commonMeasurements.starpowers,
    exports.commonMeasurements.gadgets,
];
var playerBrawlerSlices = [
    commonSlices.playerTag,
    commonSlices.playerName,
    commonSlices.season,
    commonSlices.trophies,
    commonSlices.brawlerId,
    commonSlices.brawler,
];
var playerBrawlerDefaultSliceValues = {
    playerTag: [],
    playerName: [],
    season: ['current'],
    trophies: [],
    brawlerId: [],
    brawlerName: []
};
var cubes = {
    map: {
        id: 'map',
        table: 'map_meta',
        name: 'Map',
        hidden: false,
        dimensions: __spreadArray(__spreadArray([], brawlerBattleDimensions), [
            commonDimensions.mode,
            commonDimensions.map,
        ]),
        defaultDimensionsIds: ['brawler'],
        measurements: __spreadArray([], brawlerBattleMeasurements),
        defaultMeasurementIds: ['winRateAdj'],
        metaColumns: ['picks', 'timestamp'],
        slices: __spreadArray(__spreadArray([], brawlerBattleSlices), [
            commonSlices.mode,
            commonSlices.map,
            commonSlices.mapLike,
            commonSlices.mapNotLike,
            commonSlices.powerplay,
        ]),
        defaultSliceValues: __assign(__assign({}, brawlerBattleDefaultSliceValues), { mode: [], map: [], mapLike: [], mapNotLike: [], powerplay: ['false'] })
    },
    starpower: {
        id: 'starpower',
        table: 'starpower_meta',
        name: 'Star Power',
        hidden: false,
        dimensions: __spreadArray(__spreadArray([], brawlerBattleDimensions), [
            commonDimensions.brawlerId,
            commonDimensions.starpower,
        ]),
        defaultDimensionsIds: ['brawler', 'starpower'],
        measurements: __spreadArray([], Object.values(brawlerBattleMeasurements)),
        defaultMeasurementIds: ['winRateAdj'],
        metaColumns: ['picks', 'timestamp'],
        slices: __spreadArray(__spreadArray([], brawlerBattleSlices), [
            commonSlices.withStarpower,
        ]),
        defaultSliceValues: __assign(__assign({}, brawlerBattleDefaultSliceValues), { withStarpower: ['true'] })
    },
    gadget: {
        id: 'gadget',
        table: 'gadget_meta',
        name: 'Gadget',
        hidden: false,
        dimensions: __spreadArray(__spreadArray([], brawlerBattleDimensions), [
            commonDimensions.brawlerId,
            commonDimensions.gadget,
        ]),
        defaultDimensionsIds: ['brawler', 'gadget'],
        measurements: __spreadArray([], brawlerBattleMeasurements),
        defaultMeasurementIds: ['winRateAdj'],
        metaColumns: ['picks', 'timestamp'],
        slices: __spreadArray(__spreadArray([], brawlerBattleSlices), [
            commonSlices.withGadget,
        ]),
        defaultSliceValues: __assign(__assign({}, brawlerBattleDefaultSliceValues), { withGadget: ['true'] })
    },
    synergy: {
        id: 'synergy',
        table: 'synergy_meta',
        name: 'Synergies',
        hidden: false,
        dimensions: __spreadArray(__spreadArray([], brawlerBattleDimensions), [
            commonDimensions.brawlerId,
            commonDimensions.ally,
            commonDimensions.allyId,
            commonDimensions.mode,
            commonDimensions.map,
        ]),
        defaultDimensionsIds: ['brawler'],
        measurements: __spreadArray([], brawlerBattleMeasurements),
        defaultMeasurementIds: ['winRateAdj'],
        metaColumns: ['picks', 'timestamp'],
        slices: __spreadArray(__spreadArray([], brawlerBattleSlices), [
            commonSlices.mode,
            commonSlices.map,
            commonSlices.brawlerId,
            commonSlices.ally,
            commonSlices.allyId,
        ]),
        defaultSliceValues: __assign(__assign({}, brawlerBattleDefaultSliceValues), { mode: [], map: [], ally: [] })
    },
    team: {
        id: 'team',
        table: 'team',
        name: 'Teams',
        hidden: false,
        dimensions: [
            commonDimensions.team,
        ],
        defaultDimensionsIds: ['team'],
        measurements: [
            exports.commonMeasurements.wins,
            exports.commonMeasurements.picks,
            exports.commonMeasurements.winRate,
        ],
        defaultMeasurementIds: ['wins'],
        metaColumns: ['picks', 'timestamp'],
        slices: __spreadArray(__spreadArray([], brawlerBattleSlices), [
            commonSlices.mode,
            commonSlices.map,
            commonSlices.brawlerId,
            commonSlices.ally,
            commonSlices.allyId,
        ]),
        defaultSliceValues: __assign(__assign({}, brawlerBattleDefaultSliceValues), { mode: [], map: [], ally: [] })
    },
    player: {
        id: 'player',
        table: 'player',
        name: 'Leaderboard',
        hidden: true,
        dimensions: [
            commonDimensions.player,
        ],
        defaultDimensionsIds: ['player'],
        measurements: [
            exports.commonMeasurements.playerName,
            exports.commonMeasurements.playerIcon,
            exports.commonMeasurements.expPoints,
            exports.commonMeasurements.victories,
            exports.commonMeasurements.soloVictories,
            exports.commonMeasurements.duoVictories,
        ],
        defaultMeasurementIds: ['victories'],
        metaColumns: ['timestamp'],
        slices: [
            commonSlices.timestamp,
        ],
        defaultSliceValues: {
            timestamp: []
        }
    },
    player_brawler: {
        id: 'player_brawler',
        table: 'player_brawler',
        name: 'Brawler Leaderboard',
        hidden: false,
        dimensions: [
            commonDimensions.player,
            commonDimensions.brawlerId,
        ],
        defaultDimensionsIds: ['player'],
        measurements: [
            exports.commonMeasurements.playerName,
            exports.commonMeasurements.playerIcon,
            exports.commonMeasurements.brawler,
            exports.commonMeasurements.highestTrophies,
        ],
        defaultMeasurementIds: ['highestTrophies'],
        metaColumns: ['timestamp'],
        slices: [
            commonSlices.timestamp,
        ],
        defaultSliceValues: {
            timestamp: []
        }
    },
    brawler: {
        id: 'brawler',
        table: 'brawler',
        name: 'Raw Brawlers',
        hidden: true,
        dimensions: __spreadArray([], playerBrawlerDimensions),
        defaultDimensionsIds: ['player'],
        measurements: __spreadArray([], playerBrawlerMeasurements),
        defaultMeasurementIds: ['picks'],
        metaColumns: ['timestamp'],
        slices: __spreadArray([], playerBrawlerSlices),
        defaultSliceValues: __assign({}, playerBrawlerDefaultSliceValues)
    },
    battle: {
        id: 'battle',
        table: 'battle',
        name: 'Raw Battles',
        hidden: true,
        dimensions: __spreadArray(__spreadArray([], playerBrawlerDimensions), [
            commonDimensions.mode,
            commonDimensions.map,
            commonDimensions.powerplay,
        ]),
        defaultDimensionsIds: ['player'],
        measurements: __spreadArray(__spreadArray([], playerBrawlerMeasurements), [
            exports.commonMeasurements.wins,
            exports.commonMeasurements.duration,
            exports.commonMeasurements.rank,
            exports.commonMeasurements.rank1,
            exports.commonMeasurements.trophyChange,
            exports.commonMeasurements.winRate,
        ]),
        defaultMeasurementIds: ['picks'],
        metaColumns: ['timestamp'],
        slices: __spreadArray(__spreadArray([], playerBrawlerSlices), [
            commonSlices.mode,
            commonSlices.map,
            commonSlices.powerplay,
        ]),
        defaultSliceValues: __assign(__assign({}, playerBrawlerDefaultSliceValues), { mode: [], map: [], powerplay: [] })
    }
};
exports["default"] = cubes;
