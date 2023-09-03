const express = require('express');
const playerService = require('../services/player').getInstance();

const router = express.Router();

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
    console.error('Error retrieving player stats:', error);
    res.status(400).json({ error: 'Failed to retrieve stats: ' + error });
  }
});

router.get('/byName', async (req, res) => {
  try {
    const result = await playerService.getPlayerAllStats(req.query.name);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error retrieving player stats:', error);
    res.status(400).json({ error: 'Failed to retrieve stats: ' + error });
  }
});

router.post('/', async (req, res) => {
  try {
    const playerStats = req.body;
    const newPlayer = await playerService.createPlayerStats(playerStats);
    res.status(201).json(newPlayer);
  } catch (error) {
    console.error('Error creating player:', error);
    res.status(400).json({ error: 'Failed to create player : ' + error });
  }
});

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
    console.error('Error updating player stats:', error);
    res.status(400).json({ error: 'Failed to update player stats: ' + error });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await playerService.deletePlayerStatsById(req.params.id);
    res.status(200).json({ message: 'Suppression réussie' });
  } catch (error) {
    console.error('Error deleting player stats:', error);
    res.status(400).json({ error: 'Failed to delete player stats: ' + error });
  }
});

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
        res.status(400).json({ error: 'Equipe NBA introuvable' });
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
      res.status(400).json({ error: "Le nom de l'équipe est requise" });
    }
  } catch (error) {
    console.error('Error retrieving player stats:', error);
    res.status(400).json({ error: 'Failed to retrieve stats: ' + error });
  }
});

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
        res.status(400).json({ error: 'Equipe NBA introuvable' });
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
    console.error('Error retrieving player stats:', error);
    res.status(400).json({ error: 'Failed to retrieve stats: ' + error });
  }
});

module.exports = router;
