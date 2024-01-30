const Sequelize = require('sequelize');

const sequelize = require('../db');

const Course = sequelize.define('Course', {
  name: {
    type: Sequelize.STRING(200),
    allowNull: false
  },
  description: {
    type: Sequelize.STRING(1000)
  }
});

module.exports = Course;
