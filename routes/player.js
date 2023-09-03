// Importation du framework Express
const express = require('express');

// Importation de l'instance unique de PlayerService
const playerService = require('../services/player').getInstance();

// Création d'un routeur Express
const router = express.Router();

// Route pour obtenir des joueurs distincts par nom avec un filtre
router.get('/', async (req, res) => {
  const filter = req.query.filter;
  try {
    let result = [];
    if (filter && filter.trim().length > 0) {
      result = await playerService.getDistinctPlayerByNameIncludes(filter);
    } else {
      result = await playerService.getDistinctPlayer();
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des statistiques des joueurs :',
      error
    );
    res
      .status(400)
      .json({ error: 'Échec de la récupération des statistiques : ' + error });
  }
});

// Route pour obtenir toutes les statistiques d'un joueur par son nom
router.get('/byName', async (req, res) => {
  try {
    const result = await playerService.getPlayerAllStats(req.query.name);
    res.status(200).json(result);
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des statistiques des joueurs :',
      error
    );
    res
      .status(400)
      .json({ error: 'Échec de la récupération des statistiques : ' + error });
  }
});

// Route pour créer un nouveau joueur
router.post('/', async (req, res) => {
  try {
    const playerStats = req.body;
    const newPlayer = await playerService.createPlayerStats(playerStats);
    res.status(201).json(newPlayer);
  } catch (error) {
    console.error('Erreur lors de la création du joueur :', error);
    res
      .status(400)
      .json({ error: 'Échec de la création du joueur : ' + error });
  }
});

// Route pour mettre à jour les statistiques d'un joueur
router.put('/', async (req, res) => {
  try {
    const playerStats = req.body;
    if (!playerStats._id) {
      res.status(400).json({ error: 'ID obligatoire ' });
      return;
    }
    const newPlayer = await playerService.updatePlayerStats(playerStats);
    res.status(200).json(newPlayer);
  } catch (error) {
    console.error(
      'Erreur lors de la mise à jour des statistiques du joueur :',
      error
    );
    res.status(400).json({
      error: 'Échec de la mise à jour des statistiques du joueur : ' + error,
    });
  }
});

// Route pour supprimer les statistiques d'un joueur par ID
router.delete('/:id', async (req, res) => {
  try {
    await playerService.deletePlayerStatsById(req.params.id);
    res.status(200).json({ message: 'Suppression réussie' });
  } catch (error) {
    console.error(
      'Erreur lors de la suppression des statistiques du joueur :',
      error
    );
    res.status(400).json({
      error: 'Échec de la suppression des statistiques du joueur : ' + error,
    });
  }
});

// Route pour obtenir les statistiques des joueurs par équipe et saison
router.get('/stats', async (req, res) => {
  const team = req.query.team;
  const season = req.query.season;
  try {
    let result = [];
    if (team && team.trim().length > 0) {
      const nbaTeam = playerService
        .getAllTeams()
        .find((t) => t.name.toLowerCase() === team.toLowerCase());
      if (!nbaTeam) {
        res.status(400).json({ error: 'Équipe NBA introuvable' });
        return;
      }
      if (season && season.trim().length > 0) {
        result = await playerService.getStatsByTeamAndSeason(
          nbaTeam.abbr,
          season
        );
        res.status(200).json(result);
      } else {
        res.status(400).json({ error: 'La saison est requise' });
      }
    } else {
      res.status(400).json({ error: "Le nom de l'équipe est requis" });
    }
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des statistiques des joueurs :',
      error
    );
    res
      .status(400)
      .json({ error: 'Échec de la récupération des statistiques : ' + error });
  }
});

// Route pour obtenir le classement des joueurs par unité (pts, ast, reb)
router.get('/ranks/:unit', async (req, res) => {
  const team = req.query.team;
  const season = req.query.season;
  const size = Number(req.query.size || 10);

  const unit = req.params.unit;

  if (!unit || !['pts', 'ast', 'reb'].includes(unit)) {
    res.status(400).json({
      error:
        'Paramètres de ranking non conforme : Veuillez choisir entre ["pts", "ast", "reb"]',
    });
    return;
  }

  try {
    let result = [];
    if (team && team.trim().length > 0) {
      const nbaTeam = playerService
        .getAllTeams()
        .find((t) => t.name.toLowerCase() === team.toLowerCase());
      if (!nbaTeam) {
        res.status(400).json({ error: 'Équipe NBA introuvable' });
        return;
      }
      if (season && season.trim().length > 0) {
        result = await playerService.getTopTotalPerSeasonAndTeam(
          unit,
          season,
          nbaTeam.abbr,
          size
        );
      } else {
        result = await playerService.getAllTimeTopTotalPerTeam(
          unit,
          nbaTeam.abbr,
          size
        );
      }
    } else {
      if (season && season.trim().length > 0) {
        result = await playerService.getTopTotalPerSeason(unit, season, size);
      } else {
        result = await playerService.getAllTimeTopTotal(unit, size);
      }
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des statistiques des joueurs :',
      error
    );
    res
      .status(400)
      .json({ error: 'Échec de la récupération des statistiques : ' + error });
  }
});

// Exportation du routeur Express pour utilisation dans d'autres parties de l'application
module.exports = router;
