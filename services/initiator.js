// Importation des modules nécessaires
const fs = require('fs'); // Module pour gérer le système de fichiers
const csv = require('csv-parser'); // Module pour analyser les fichiers CSV
const Player = require('../models/player'); // Importation du modèle de données Player

// Définition de la classe InitiatorService pour l'initialisation de la base de données
let instance = null;

class InitiatorService {
  // Méthode statique pour obtenir une instance unique de la classe InitiatorService
  static getInstance() {
    if (instance == null) {
      instance = new InitiatorService();
    }
    return instance;
  }

  // Méthode d'initialisation de la base de données
  async init() {
    console.log(
      "Initialisation des données à partir de l'API des statistiques des joueurs NBA"
    );

    // Réinitialisation de la collection des joueurs
    await this.reset();

    // Création d'un flux pour lire le fichier CSV
    const csvFilePath = `${__dirname}/../players_stats.csv`; // Chemin vers le fichier CSV
    const stream = fs.createReadStream(csvFilePath).pipe(csv()); // Création du flux

    // Événement de lecture des données du flux
    stream.on('data', (data) => {
      // Vérification si le nom du joueur existe et n'est pas vide
      if (data.player_name && data.player_name.trim().length > 0) {
        // Création d'une instance de Player avec les données du CSV
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

        // Sauvegarde de l'instance Player dans la base de données MongoDB
        player
          .save()
          .then(() => {})
          .catch((error) =>
            console.error(
              'Erreur lors de la sauvegarde des données du joueur : ' +
                data.player_name +
                ' ' +
                data.season,
              error
            )
          );
      }
    });
  }

  // Méthode pour réinitialiser la collection des joueurs
  async reset() {
    try {
      const result = await Player.deleteMany({}); // Suppression de tous les documents dans la collection

      console.log(
        `Collection réinitialisée : ${result.deletedCount} documents supprimés.`
      );
    } catch (error) {
      console.error(
        'Erreur lors de la réinitialisation de la collection :',
        error
      );
    }
  }
}

// Exportation de la classe InitiatorService pour une utilisation dans d'autres parties de l'application
module.exports = InitiatorService;
