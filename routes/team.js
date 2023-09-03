const express = require('express');
const playerService = require('../services/player').getInstance();

const router = express.Router();

router.get('/', async (req, res) => {
  res.status(200).json(playerService.getAllTeams());
});

module.exports = router;
