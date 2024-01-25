const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

const sequelize = require('../db');
// TODO: add role_id when role model will be done

const User = sequelize.define('User', {
	name: { type: Sequelize.STRING(80), allowNull: false },
	rating: {
		type: Sequelize.FLOAT,
		allowNull: false,
		defaultValue: 0,
	},
	login: {
		type: Sequelize.STRING(50),
		unique: true,
		allowNull: false,
	},
	password: {
		type: Sequelize.STRING(),
		allowNull: false,
	},
});

const hashPassword = async (password) => {
	const saltRounds = 12;
	return await bcrypt.hash(password, saltRounds);
};

User.beforeSave(async (user) => {
	if (user.changed('password')) {
		user.password = await hashPassword(user.password);
	}
});

User.prototype.verifyPassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

module.exports = User;
