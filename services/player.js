const Player = require('../models/player');

let instance = null;

const nbaTeams = [
  { name: 'Atlanta Hawks', abbr: ['ATL'] },
  { name: 'Brooklyn Nets', abbr: ['BKN', 'NJN'] },
  { name: 'Boston Celtics', abbr: ['BOS'] },
  { name: 'Charlotte Hornets', abbr: ['CHA', 'CHH'] },
  { name: 'Chicago Bulls', abbr: ['CHI'] },
  { name: 'Cleveland Cavaliers', abbr: ['CLE'] },
  { name: 'Dallas Mavericks', abbr: ['DAL'] },
  { name: 'Denver Nuggets', abbr: ['DEN'] },
  { name: 'Detroit Pistons', abbr: ['DET'] },
  { name: 'Golden State Warriors', abbr: ['GSW'] },
  { name: 'Houston Rockets', abbr: ['HOU'] },
  { name: 'Indiana Pacers', abbr: ['IND'] },
  { name: 'LA Clippers', abbr: ['LAC'] },
  { name: 'Los Angeles Lakers', abbr: ['LAL'] },
  { name: 'Memphis Grizzlies', abbr: ['MEM', 'VAN'] },
  { name: 'Miami Heat', abbr: ['MIA'] },
  { name: 'Milwaukee Bucks', abbr: ['MIL'] },
  { name: 'Minnesota Timberwolves', abbr: ['MIN'] },
  { name: 'New Orleans Pelicans', abbr: ['NOP', 'NOK', 'SEA'] },
  { name: 'New York Knicks', abbr: ['NYK'] },
  { name: 'Oklahoma City Thunder', abbr: ['OKC', 'NOK', 'SEA'] },
  { name: 'Orlando Magic', abbr: ['ORL'] },
  { name: 'Philadelphia 76ers', abbr: ['PHI'] },
  { name: 'Phoenix Suns', abbr: ['PHX'] },
  { name: 'Portland Trail Blazers', abbr: ['POR'] },
  { name: 'Sacramento Kings', abbr: ['SAC'] },
  { name: 'San Antonio Spurs', abbr: ['SAS'] },
  { name: 'Toronto Raptors', abbr: ['TOR'] },
  { name: 'Utah Jazz', abbr: ['UTA'] },
  { name: 'Washington Wizards', abbr: ['WAS'] },
];

class PlayerService {
  static getInstance() {
    if (instance == null) {
      instance = new PlayerService();
    }
    return instance;
  }

  async getStatsByTeamAndSeason(teams, season) {
    try {
      // Use the `find` method to query the database
      const stats = await Player.find({
        team_abbreviation: { $in: teams },
        season: season,
      }).sort({ pts: -1 });

      return stats;
    } catch (error) {
      console.error('Error fetching player statistics:', error);
      throw error; // Optionally, rethrow the error to handle it elsewhere
    }
  }

  async getPlayerAllStats(playerName) {
    try {
      const playerStats = await Player.find({
        player_name: playerName,
      }).sort({ season: -1 });

      return playerStats;
    } catch (error) {
      throw error;
    }
  }

  async getTopTotalPerSeason(unit, season, limit) {
    try {
      const topPlayers = await Player.aggregate([
        {
          $match: {
            season: season,
          },
        },
        {
          $addFields: {
            total: { $multiply: ['$' + unit, '$gp'] },
          },
        },
        {
          $sort: { total: -1 },
        },
        {
          $limit: limit,
        },
      ]);

      return topPlayers;
    } catch (error) {
      throw error;
    }
  }

  async getTopTotalPerSeasonAndTeam(unit, season, teams, limit) {
    try {
      const pipeline = [
        {
          $match: {
            season: season,
            team_abbreviation: { $in: teams }, // Filter by specified teams
          },
        },
        {
          $addFields: {
            total: { $multiply: ['$' + unit, '$gp'] },
          },
        },
        {
          $sort: { total: -1 },
        },
        {
          $limit: limit,
        },
      ];

      const topPlayers = await Player.aggregate(pipeline);

      return topPlayers;
    } catch (error) {
      throw error;
    }
  }

  async getAllTimeTopTotalPerTeam(unit, teams, limit) {
    try {
      const pipeline = [
        {
          $match: {
            team_abbreviation: { $in: teams }, // Filter by specified teams
          },
        },
        {
          $group: {
            _id: '$player_name', // Group by player name
            total: { $sum: { $multiply: ['$' + unit, '$gp'] } }, // Calculate total points
            seasons: { $addToSet: '$season' },
          },
        },
        {
          $sort: { total: -1 },
        },
        {
          $limit: limit,
        },
      ];

      const topPlayers = await Player.aggregate(pipeline);

      return topPlayers;
    } catch (error) {
      throw error;
    }
  }

  async getAllTimeTopTotal(unit, limit) {
    try {
      const pipeline = [
        {
          $group: {
            _id: '$player_name', // Group by player name
            total: { $sum: { $multiply: ['$' + unit, '$gp'] } }, // Calculate total points
            seasons: { $addToSet: '$season' },
          },
        },
        {
          $sort: { total: -1 },
        },
        {
          $limit: limit,
        },
      ];

      const topPlayers = await Player.aggregate(pipeline);

      return topPlayers;
    } catch (error) {
      throw error;
    }
  }

  async createPlayerStats(playerStats) {
    try {
      const existsPlayer = await Player.findOne({
        player_name: playerStats.player_name,
        season: playerStats.season,
      });

      if (existsPlayer) {
        throw new Error(
          'Player Stat existe déjà pour le même joueur et la saison'
        );
      }
      const player = new Player(playerStats);

      const savedPlayer = await player.save();

      return savedPlayer;
      return;
    } catch (error) {
      throw error;
    }
  }

  async updatePlayerStats(playerStats) {
    try {
      const { _id, ...update } = playerStats;

      const updatedPlayer = await Player.findByIdAndUpdate(_id, update, {
        new: true,
      });

      if (!updatedPlayer) {
        throw new Error('Player Stat not found');
      }

      return updatedPlayer;
    } catch (error) {
      throw error;
    }
  }

  async deletePlayerStatsById(playerId) {
    try {
      const deletedPlayer = await Player.findByIdAndRemove(playerId);

      if (!deletedPlayer) {
        throw new Error('Player Stat not found');
      }

      return deletedPlayer;
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  }

  getAllTeams() {
    return nbaTeams;
  }

  async getDistinctPlayerByNameIncludes(filter) {
    try {
      const distinctNames = await Player.aggregate([
        {
          $match: {
            player_name: { $regex: filter, $options: 'i' },
          },
        },
        {
          $group: {
            _id: '$player_name',
            seasons: { $addToSet: '$season' },
          },
        },
      ]);

      return distinctNames;
    } catch (error) {
      console.error('Error getting distinct player names:', error);
      throw error;
    }
  }

  async getDistinctPlayer() {
    try {
      const distinctNames = await Player.aggregate([
        {
          $group: {
            _id: '$player_name',
            seasons: { $addToSet: '$season' },
          },
        },
      ]);

      return distinctNames;
    } catch (error) {
      console.error('Error getting distinct player names:', error);
      throw error;
    }
  }

  async getDistinctSeasons() {
    try {
      const distinctSeasons = await Player.distinct('season');
      const sortedSeasons = distinctSeasons.sort((a, b) => b.localeCompare(a));

      return sortedSeasons;
    } catch (error) {
      console.error('Error getting distinct seasons:', error);
      throw error;
    }
  }
}

module.exports = PlayerService;
