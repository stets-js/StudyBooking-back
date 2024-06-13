const Sequelize = require('sequelize');

const sequelize = require('../db');

const Feedback = sequelize.define('feedback', {
  report: {
    type: Sequelize.STRING
  }
});
module.exports = Feedback;
