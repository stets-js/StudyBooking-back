const {DataTypes} = require('sequelize');

const sequelize = require('../db');

const UserDocument = sequelize.define('UserDocument', {
  documents: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false
  }
});
module.exports = {UserDocument};
