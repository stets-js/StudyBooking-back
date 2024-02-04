const sequelize = require('../db');

const User = require('./user.model');
const Role = require('./role.model');
const Course = require('./course.model');
const {Slot, Appointment_Type} = require('./slot.model');

User.belongsTo(Role);
Role.hasMany(User);

const TeacherCourse = sequelize.define('TeacherCourse', {});

Slot.hasMany(Appointment_Type, {foreignKey: 'slotId'});
Appointment_Type.belongsTo(Slot, {foreignKey: 'slotId'});

User.hasMany(Slot, {foreignKey: 'userId'});
Slot.belongsTo(User, {foreignKey: 'userId'});

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

Slot.beforeFind(async options => {
  options.attributes = options.attributes || {};
  options.attributes.exclude = options.attributes.exclude || [];

  options.include = options.include || [];
  options.include.push({
    model: Appointment_Type,
    attributes: ['id', 'name']
  });
});

module.exports = {User, Role, Course, TeacherCourse, Slot, Appointment_Type};
