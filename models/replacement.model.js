const Sequelize = require('sequelize');

const sequelize = require('../db');

const Replacement = sequelize.define('Replacement', {
  description: {
    type: Sequelize.STRING
  }
});

module.exports = Replacement;
