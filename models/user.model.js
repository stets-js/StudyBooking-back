const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

const sequelize = require('../db');

const User = sequelize.define('User', {
  name: {type: Sequelize.STRING(80), allowNull: false},
  rating: {
    type: Sequelize.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  email: {
    type: Sequelize.STRING,
    validate: {isEmail: true},
    unique: true,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  phone: {
    type: Sequelize.STRING,
    // allowNull: false,
    default: '+380123456789'
  },
  city: {
    type: Sequelize.STRING,
    // allowNull: false,
    default: 'Kharkiv'
  }
});

const hashPassword = async password => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

User.beforeSave(async user => {
  if (user.changed('password')) {
    user.password = await hashPassword(user.password);
  }
});

User.prototype.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
