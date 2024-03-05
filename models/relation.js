const sequelize = require('../db');

const User = require('./user.model');
const Role = require('./role.model');
const {Course, TeacherCourse} = require('./course.model');
const {Slot, Appointment_Type} = require('./slot.model');
const SubGroup = require('./subgroup.model');
const Replacement = require('./replacement.model');

User.belongsTo(Role);
Role.hasMany(User);

Slot.belongsTo(Appointment_Type, {foreignKey: 'appointmentTypeId'});
Appointment_Type.hasMany(Slot, {foreignKey: 'appointmentTypeId'});

User.hasMany(Slot, {foreignKey: 'userId'});
Slot.belongsTo(User, {foreignKey: 'userId'});

User.belongsToMany(Course, {
  through: TeacherCourse,
  foreignKey: 'userId',
  otherKey: 'courseId',
  as: 'Courses'
});

Course.belongsToMany(User, {
  through: TeacherCourse,
  foreignKey: 'courseId',
  otherKey: 'userId'
});

Course.belongsTo(User, {as: 'teamLead', foreignKey: 'teamLeadId'});
User.hasMany(Course, {foreignKey: 'teamLeadId'});

User.hasMany(SubGroup, {foreignKey: 'adminId'});
SubGroup.belongsTo(User, {foreignKey: 'adminId'});

User.hasMany(SubGroup, {foreignKey: 'mentorId'});
SubGroup.belongsTo(User, {foreignKey: 'mentorId'});

Course.hasMany(SubGroup);
SubGroup.belongsTo(Course);

SubGroup.hasMany(Slot, {onDelete: 'CASCADE'});
Slot.belongsTo(SubGroup);

Replacement.hasMany(Slot, {onDelete: 'CASCADE'});
Slot.belongsTo(Replacement);

Replacement.belongsTo(SubGroup);
SubGroup.hasMany(Replacement, {onDelete: 'CASCADE'});

User.beforeFind(async options => {
  options.attributes = options.attributes || {};
  options.attributes.exclude = options.attributes.exclude || [];

  options.include = options.include || [];
  options.include.push({
    model: Role,
    attributes: ['id', 'name']
  });
});
Replacement.beforeFind(async options => {
  options.attributes = options.attributes || {};
  options.attributes.exclude = options.attributes.exclude || [];

  options.include = options.include || [];
  options.include.push({
    model: SubGroup,
    attributes: ['id', 'name', 'description', 'adminId', 'CourseId'],
    include: {model: User, attributes: ['id', 'name']}
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

module.exports = {User, Role, Course, TeacherCourse, Slot, Appointment_Type, SubGroup, Replacement};
