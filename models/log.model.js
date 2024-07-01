const {DataTypes} = require('sequelize');
const sequelize = require('../db');
const User = require('./user.model');
const Logs = sequelize.define('Logs', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  method: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  body: {
    type: DataTypes.JSON
  }
});

module.exports = Logs;
