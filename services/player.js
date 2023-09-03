// Importation du modèle Player pour interagir avec la base de données MongoDB
const Player = require('../models/player');

// Création d'une instance unique de la classe PlayerService
let instance = null;

// Liste des équipes NBA avec leurs noms et abréviations
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

// Définition de la classe PlayerService pour gérer les opérations liées aux joueurs
class PlayerService {
  // Méthode statique pour obtenir une instance unique de la classe PlayerService
  static getInstance() {
    if (instance == null) {
      instance = new PlayerService();
    }
    return instance;
  }

  // Méthode pour obtenir les statistiques des joueurs par équipe et saison
  async getStatsByTeamAndSeason(teams, season) {
    try {
      // Utilisation de la méthode `find` pour interroger la base de données
      const stats = await Player.find({
        team_abbreviation: { $in: teams },
        season: season,
      }).sort({ pts: -1 });

      return stats;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des statistiques des joueurs :',
        error
      );
      throw error; // Optionnellement, relancer l'erreur pour la gérer ailleurs
    }
  }

  // Méthode pour obtenir toutes les statistiques d'un joueur par son nom
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

  // Méthode pour obtenir les meilleurs totaux par saison (points, rebonds, assists, etc.)
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

  // Méthode pour obtenir les meilleurs totaux par saison et équipe
  async getTopTotalPerSeasonAndTeam(unit, season, teams, limit) {
    try {
      const pipeline = [
        {
          $match: {
            season: season,
            team_abbreviation: { $in: teams }, // Filtrer par les équipes spécifiées
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

  // Méthode pour obtenir les meilleurs totaux de tous les temps par équipe
  async getAllTimeTopTotalPerTeam(unit, teams, limit) {
    try {
      const pipeline = [
        {
          $match: {
            team_abbreviation: { $in: teams }, // Filtrer par les équipes spécifiées
          },
        },
        {
          $group: {
            _id: '$player_name', // Regrouper par nom du joueur
            total: { $sum: { $multiply: ['$' + unit, '$gp'] } }, // Calculer le total (points, rebonds, assists, etc.)
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

  // Méthode pour obtenir les meilleurs totaux de tous les temps
  async getAllTimeTopTotal(unit, limit) {
    try {
      const pipeline = [
        {
          $group: {
            _id: '$player_name', // Regrouper par nom du joueur
            total: { $sum: { $multiply: ['$' + unit, '$gp'] } }, // Calculer le total (points, rebonds, assists, etc.)
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

  // Méthode pour obtenir la liste de toutes les équipes NBA
  getAllTeams() {
    return nbaTeams;
  }

  // Méthode pour obtenir les noms de joueur distincts qui incluent le filtre donné
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
      console.error(
        "Erreur lors de l'obtention des noms de joueur distincts :",
        error
      );
      throw error;
    }
  }

  // Méthode pour obtenir tous les noms de joueur distincts
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
      console.error(
        "Erreur lors de l'obtention des noms de joueur distincts :",
        error
      );
      throw error;
    }
  }

  // Méthode pour obtenir toutes les saisons distinctes
  async getDistinctSeasons() {
    try {
      const distinctSeasons = await Player.distinct('season');
      const sortedSeasons = distinctSeasons.sort((a, b) => b.localeCompare(a));

      return sortedSeasons;
    } catch (error) {
      console.error(
        "Erreur lors de l'obtention des saisons distinctes :",
        error
      );
      throw error;
    }
  }

  // Méthode pour créer des statistiques de joueur
  async createPlayerStats(playerStats) {
    try {
      const existsPlayer = await Player.findOne({
        player_name: playerStats.player_name,
        season: playerStats.season,
      });

      if (existsPlayer) {
        throw new Error(
          'Les statistiques du joueur existent déjà pour le même joueur et la même saison'
        );
      }
      const player = new Player(playerStats);

      const savedPlayer = await player.save();

      return savedPlayer;
    } catch (error) {
      throw error;
    }
  }

  // Méthode pour mettre à jour les statistiques d'un joueur
  async updatePlayerStats(playerStats) {
    try {
      const { _id, ...update } = playerStats;

      const updatedPlayer = await Player.findByIdAndUpdate(_id, update, {
        new: true,
      });

      if (!updatedPlayer) {
        throw new Error('Statistiques du joueur introuvables');
      }

      return updatedPlayer;
    } catch (error) {
      throw error;
    }
  }

  // Méthode pour supprimer les statistiques d'un joueur par ID
  async deletePlayerStatsById(playerId) {
    try {
      const deletedPlayer = await Player.findByIdAndRemove(playerId);

      if (!deletedPlayer) {
        throw new Error('Statistiques du joueur introuvables');
      }

      return deletedPlayer;
    } catch (error) {
      console.error('Erreur lors de la suppression du joueur :', error);
      throw error;
    }
  }
}

// Exportation de la classe PlayerService pour une utilisation dans d'autres parties de l'application
module.exports = PlayerService;
