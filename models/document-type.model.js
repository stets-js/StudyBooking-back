const Sequelize = require('sequelize');

const sequelize = require('../db');

const DocumentType = sequelize.define('DocumentType', {
  name: {
    type: Sequelize.STRING
  }
});
module.exports = {DocumentType};
