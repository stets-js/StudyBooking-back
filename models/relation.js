const sequelize = require('../db');

const User = require('./user.model');
const Role = require('./role.model');
const Course = require('./course.model');

User.belongsTo(Role);
Role.hasMany(User);

const UserCourse = sequelize.define('UserCourse', {});

User.belongsToMany(Course, {through: UserCourse});
Course.belongsToMany(User, {through: UserCourse});

User.beforeFind(async options => {
  options.attributes = options.attributes || {};
  options.attributes.exclude = options.attributes.exclude || [];

  options.include = options.include || [];
  options.include.push({
    model: Role,
    attributes: ['id', 'name']
  });
});

module.exports = {User, Role, Course, UserCourse};
