const Sequelize = require('sequelize');
const User = require('./user.model');
const Role = require('./role.model');
const {Course, TeacherCourse} = require('./course.model');
const {Slot, Appointment_Type} = require('./slot.model');
const SubGroup = require('./subgroup.model');
const Replacement = require('./replacement.model');
const {TeacherType} = require('./teacher-type.model');

User.belongsTo(Role);
Role.hasMany(User);

Slot.belongsTo(Appointment_Type, {foreignKey: 'appointmentTypeId'});
Appointment_Type.hasMany(Slot, {foreignKey: 'appointmentTypeId'});

User.hasMany(Slot, {foreignKey: 'userId', onDelete: 'CASCADE'});
Slot.belongsTo(User, {foreignKey: 'userId'});

User.belongsToMany(Course, {
  through: TeacherCourse,
  foreignKey: 'userId',
  otherKey: 'courseId',
  as: 'teachingCourses',
  onDelete: 'CASCADE'
});

Course.belongsToMany(User, {
  through: TeacherCourse,
  foreignKey: 'courseId',
  otherKey: 'userId',
  as: 'teachers',
  onDelete: 'CASCADE'
});
Course.belongsTo(User, {as: 'teamLead', foreignKey: 'teamLeadId'});
User.hasMany(Course, {foreignKey: 'teamLeadId'});

TeacherType.hasMany(TeacherCourse, {foreignKey: 'TeacherTypeId'});
TeacherCourse.belongsTo(TeacherType, {
  foreignKey: 'TeacherTypeId'
});
User.hasMany(SubGroup, {foreignKey: 'adminId', as: 'AdminSubGroups'});
SubGroup.belongsTo(User, {foreignKey: 'adminId', as: 'Admin'});

User.hasMany(SubGroup, {
  foreignKey: 'softMentorId',
  as: 'SoftMentorSubGroups',
  onDelete: 'CASCADE'
});
User.hasMany(SubGroup, {
  foreignKey: 'techMentorId',
  as: 'TechMentorSubGroups',
  onDelete: 'CASCADE'
});

Replacement.belongsTo(User, {foreignKey: 'mentorId', as: 'Mentor'});

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
  options.attributes.exclude.push('createdAt', 'updatedAt');
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
    model: User,
    as: 'Mentor',
    attributes: ['name'],
    foreignKey: 'mentorId'
  });
  options.include.push({
    model: SubGroup,
    attributes: ['id', 'name', 'description', 'adminId', 'CourseId'],
    include: [
      {
        model: User,
        as: 'Admin',
        attributes: ['name'],
        foreignKey: 'adminId'
      },
      {
        model: Course,
        attributes: ['name', 'id']
      }
    ]
  });
});

Slot.beforeFind(async options => {
  options.attributes = options.attributes || {};
  options.attributes.exclude = options.attributes.exclude || [];
  options.attributes.exclude.push('createdAt', 'updatedAt');
  options.include = options.include || [];
  options.include.push(
    {
      model: Appointment_Type,
      attributes: ['id', 'name']
    },
    {
      model: SubGroup,
      attributes: ['id', 'name', 'description', 'startDate', 'endDate', 'link', 'schedule'],
      include: [
        Course,
        {
          model: User,
          as: 'Admin',
          attributes: ['name'],
          foreignKey: 'adminId'
        }
      ]
    },
    {
      model: Replacement,
      attributes: ['id', 'schedule', 'description'],
      include: {
        model: SubGroup,
        include: [
          {model: Course},
          {
            model: User,
            as: 'Admin',
            attributes: ['name'],
            foreignKey: 'adminId'
          }
        ]
      }
    }
  );
});

SubGroup.beforeFind(async options => {
  options.attributes = options.attributes || {};
  options.attributes.exclude = options.attributes.exclude || [];
  options.attributes.exclude.push('createdAt', 'updatedAt');
  options.include = options.include || [];
  options.include.push(
    {
      model: User,
      as: 'Admin',
      attributes: ['name'],
      foreignKey: 'adminId'
    },
    {
      model: Course
    }
  );
});

module.exports = {
  User,
  Role,
  Course,
  TeacherCourse,
  Slot,
  Appointment_Type,
  SubGroup,
  Replacement,
  TeacherType
};
