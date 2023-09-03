const fs = require('fs');
const csv = require('csv-parser');
const Player = require('../models/player');

let instance = null;

class InitiatorService {
  static getInstance() {
    if (instance == null) {
      instance = new InitiatorService();
    }
    return instance;
  }

  async init() {
    console.log('Initializing data from NBA PLayer Stats API');
    // Fetch data from the API
    await this.reset();

    // Create a stream to read the CSV file
    const csvFilePath = `${__dirname}/../players_stats.csv`;
    const stream = fs.createReadStream(csvFilePath).pipe(csv());
    stream.on('data', (data) => {
      if (data.player_name && data.player_name.trim().length > 0) {
        const player = new Player({
          player_name: data.player_name,
          team_abbreviation: data.team_abbreviation,
          age: Number(data.age),
          player_height: Number(data.player_height),
          player_weight: Number(data.player_weight),
          college: data.college,
          country: data.country,
          gp: Number(data.gp),
          pts: Number(data.pts),
          ast: Number(data.ast),
          reb: Number(data.reb),
          season: data.season,
          draft_year:
            data.draft_year === 'Undrafted' ? null : Number(data.draft_year),
          draft_round:
            data.draft_round === 'Undrafted' ? null : Number(data.draft_round),
          draft_number:
            data.draft_number === 'Undrafted'
              ? null
              : Number(data.draft_number),
        });
        player
          .save()
          .then(() => {})
          .catch((error) =>
            console.error(
              'Error saving player data: ' +
                data.player_name +
                ' ' +
                data.season,
              error
            )
          );
      }
    });
  }

  async reset() {
    try {
      const result = await Player.deleteMany({});

      console.log(
        `Collection reset: ${result.deletedCount} documents removed.`
      );
    } catch (error) {
      console.error('Error resetting collection:', error);
    }
  }
}

module.exports = InitiatorService;
