const Sequelize = require('sequelize');

const sequelize = require('../db');

const SubGroup = sequelize.define('SubGroup', {
  link: {
    type: Sequelize.STRING
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  startDate: {
    type: Sequelize.DATE,
    default: new Date()
    // allowNull: false
  },
  endDate: {
    type: Sequelize.DATE,
    default: new Date()
    // allowNull: false
  },
  schedule: {
    type: Sequelize.TEXT
    // allowNull: false
  },
  description: {
    type: Sequelize.STRING
  }
});

module.exports = SubGroup;
