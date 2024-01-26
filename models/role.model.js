const Sequelize = require('sequelize');

const sequelize = require('../db');

const Role = sequelize.define('Role', {
	name: {
		type: Sequelize.STRING(200),
		allowNull: false,
	},
	description: { type: Sequelize.TEXT, allowNull: false },
});

module.exports = Role;
