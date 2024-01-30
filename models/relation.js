const sequelize = require('../db');

const User = require('./user.model');
const Role = require('./role.model');
const Course = require('./course.model');

User.belongsTo(Role);
Role.hasMany(User);

const TeacherCourse = sequelize.define('TeacherCourse', {});

User.belongsToMany(Course, {through: TeacherCourse});
Course.belongsToMany(User, {through: TeacherCourse});

Course.belongsTo(User, {as: 'teamLead', foreignKey: 'teamLeadId'});
User.hasMany(Course, {foreignKey: 'teamLeadId'});

User.beforeFind(async options => {
  options.attributes = options.attributes || {};
  options.attributes.exclude = options.attributes.exclude || [];

  options.include = options.include || [];
  options.include.push({
    model: Role,
    attributes: ['id', 'name']
  });
});

module.exports = {User, Role, Course, TeacherCourse};
