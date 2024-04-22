const Sequelize = require('sequelize');

const sequelize = require('../db');

const TeacherType = sequelize.define('TeacherType', {
  type: {
    type: Sequelize.ENUM('soft', 'tech', 'ulti'),
    default: 'soft',
    allowNull: false
  }
});

module.exports = {TeacherType};
