const express = require('express');
const playerService = require('../services/player').getInstance();

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const seasons = await playerService.getDistinctSeasons();
    res.status(200).json(seasons);
  } catch (error) {
    console.error('Error deleting player stats:', error);
    res.status(400).json({ error: 'Failed to delete player stats: ' + error });
  }
});

module.exports = router;
