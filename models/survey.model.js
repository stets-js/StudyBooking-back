const {DataTypes} = require('sequelize');
const sequelize = require('../db');

const Survey = sequelize.define('Survey', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

const Question = sequelize.define('Question', {
  text: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('yes_no', 'text'),
    allowNull: false
  }
});

const Answer = sequelize.define('Answer', {
  response: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = {Survey, Question, Answer};
