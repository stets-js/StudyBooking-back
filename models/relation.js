const Sequelize = require('sequelize');
const User = require('./user.model');
const Role = require('./role.model');
const {Course, TeacherCourse} = require('./course.model');
const {Slot, Appointment_Type} = require('./slot.model');
const {SubGroup, SubgroupMentor} = require('./subgroup.model');
const Replacement = require('./replacement.model');
const {TeacherType} = require('./teacher-type.model');
const {UserDocument} = require('./user-document.model');
const {DocumentType} = require('./document-type.model');
const {Lesson, LessonTopic, LessonSchedule, LessonSubgroup} = require('./lesson.model');
const {Feedback} = require('./feedback.model');
const Logs = require('./log.model');
Lesson.belongsTo(User, {foreignKey: 'mentorId'});
User.hasMany(Lesson, {foreignKey: 'mentorId'});

Lesson.belongsTo(LessonSchedule);
LessonSchedule.hasMany(Lesson);

Lesson.belongsTo(LessonTopic);
LessonTopic.hasMany(Lesson);

Lesson.belongsTo(Appointment_Type, {foreignKey: 'appointmentTypeId'});
Appointment_Type.hasMany(Lesson, {foreignKey: 'appointmentTypeId'});

Lesson.belongsTo(SubGroup, {foreignKey: 'subgroupId'});
SubGroup.hasMany(Lesson, {foreignKey: 'subgroupId'});

Lesson.hasOne(Feedback, {foreignKey: 'lessonId'});
Feedback.belongsTo(Lesson, {foreignKey: 'lessonId'});

User.belongsTo(Role);
Role.hasMany(User);

Slot.belongsTo(Appointment_Type, {foreignKey: 'appointmentTypeId'});
Appointment_Type.hasMany(Slot, {foreignKey: 'appointmentTypeId'});

User.hasMany(Slot, {foreignKey: 'userId', onDelete: 'CASCADE'});
Slot.belongsTo(User, {foreignKey: 'userId'});

User.belongsToMany(DocumentType, {through: UserDocument});
DocumentType.belongsToMany(User, {through: UserDocument});

User.hasMany(Logs, {foreignKey: 'userId', onDelete: 'CASCADE'});
Logs.belongsTo(User, {foreignKey: 'userId'});

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

Replacement.belongsTo(User, {foreignKey: 'mentorId', as: 'Mentor'});

Course.hasMany(SubGroup);
SubGroup.belongsTo(Course);

Slot.belongsTo(SubGroup, {foreignKey: 'subgroupId'});
SubGroup.hasMany(Slot, {foreignKey: 'subgroupId', onDelete: 'CASCADE'});

Replacement.hasMany(Slot, {onDelete: 'CASCADE'});
Slot.belongsTo(Replacement);

Replacement.hasMany(Lesson);
Lesson.belongsTo(Replacement);

Replacement.belongsTo(SubGroup);
SubGroup.hasMany(Replacement, {onDelete: 'CASCADE'});

User.belongsToMany(SubGroup, {
  through: SubgroupMentor,
  foreignKey: 'mentorId',
  otherKey: 'subgroupId',
  as: 'mentorSubgroups',
  onDelete: 'CASCADE'
});

SubGroup.belongsToMany(User, {
  through: SubgroupMentor,
  foreignKey: 'subgroupId',
  otherKey: 'mentorId',
  as: 'mentors',
  onDelete: 'CASCADE'
});
SubGroup.hasMany(SubgroupMentor, {foreignKey: 'subgroupId'});
SubgroupMentor.belongsTo(SubGroup, {foreignKey: 'subgroupId'});

User.hasMany(SubgroupMentor, {foreignKey: 'mentorId'});
SubgroupMentor.belongsTo(User, {foreignKey: 'mentorId'});

SubgroupMentor.belongsTo(TeacherType);
TeacherType.hasMany(SubgroupMentor);

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
// Lesson.beforeFind(async options => {
//   options.attributes = options.attributes || {};
//   options.attributes.exclude = options.attributes.exclude || [];
//   options.attributes.exclude.push('createdAt', 'updatedAt');
//   options.include = options.include || [];
//   options.include
//     .push
//     // LessonSchedule,
//     // {
//     //   model: Replacement,
//     //   include: [
//     //     {
//     //       model: SubGroup,
//     //       include: [Course, SubgroupMentor, {model: User, as: 'Admin', attributes: ['name']}]
//     //     }
//     //   ]
//     // },
//     // Appointment_Type,
//     // {
//     //   model: SubGroup,
//     //   include: [Course, SubgroupMentor, {model: User, as: 'Admin', attributes: ['name']}]
//     // }
//     ();
// });
module.exports = {
  User,
  Role,
  Course,
  TeacherCourse,
  Slot,
  Appointment_Type,
  SubGroup,
  SubgroupMentor,
  Replacement,
  TeacherType,
  Lesson,
  LessonTopic,
  LessonSchedule,
  Feedback,
  UserDocument
};
