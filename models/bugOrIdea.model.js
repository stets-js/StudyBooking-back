const Sequelize = require('sequelize');

const sequelize = require('../db');

const BugOrIdea = sequelize.define('BugOrIdea', {
  type: {
    type: Sequelize.ENUM('bug', 'idea'),
    default: 'bug',
    defaultValue: 'bug'
  },
  userName: {
    type: Sequelize.STRING
  },
  title: {type: Sequelize.STRING, allowNull: false},
  description: {
    type: Sequelize.TEXT
  },
  links: {
    type: Sequelize.ARRAY(Sequelize.STRING)
  },
  location: {type: Sequelize.STRING},
  selectedPath: {type: Sequelize.STRING}
});

module.exports = BugOrIdea;
