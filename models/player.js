const mongoose = require('../providers/mongoose');
const timestamps = require('mongoose-timestamp');

const playerSchema = new mongoose.Schema({
  player_name: {
    type: String,
    required: true,
  },
  team_abbreviation: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  player_height: {
    type: Number,
    required: true,
  },
  player_weight: {
    type: Number,
    required: true,
  },
  college: {
    type: String,
    required: false, // Not required
  },
  country: {
    type: String,
    required: true,
  },
  draft_year: {
    type: Number,
    required: false, // Not required
  },
  draft_round: {
    type: Number,
    required: false, // Not required
  },
  draft_number: {
    type: Number,
    required: false, // Not required
  },
  gp: {
    type: Number,
    required: true,
  },
  pts: {
    type: Number,
    required: true,
  },
  reb: {
    type: Number,
    required: true,
  },
  ast: {
    type: Number,
    required: true,
  },
  season: {
    type: String,
    required: true,
  },
});

playerSchema.plugin(timestamps);

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
