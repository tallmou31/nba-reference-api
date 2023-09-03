const path = `${__dirname}/.env`;

require('dotenv').config({ path });
const express = require('express');
const cors = require('cors');

const initiatorService = require('./services/initiator').getInstance();

const app = express();

const playerRoute = require('./routes/player');
const teamRoute = require('./routes/team');
const seasonRoute = require('./routes/season');

// Middleware
const corsOpts = {
  origin: '*',

  methods: ['GET', 'POST', 'PUT', 'DELETE'],

  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOpts));

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

app.use('/api/players', playerRoute);
app.use('/api/teams', teamRoute);
app.use('/api/seasons', seasonRoute);

const listener = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d', listener.address().port);
  initiatorService.init();
});
