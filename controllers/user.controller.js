const {Op, Sequelize} = require('sequelize');
const {User, Course, Slot, Appointment_Type, TeacherCourse} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory.controller');
const sequelize = require('../db');

exports.getAllUsers = factory.getAll(User);

exports.getUserById = factory.getOne(User);

exports.createUser = factory.createOne(User, {checkRole: true});

exports.deleteUser = factory.deleteOne(User);

exports.updateUser = factory.updateOne(User);

exports.getUserCourses = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(400).json({
      message: 'Cant find user'
    });
  }
  const courses = await user.getCourses();
  res.json({
    status: 'success',
    data: courses
  });
});

exports.addUserCourse = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(400).json({
      message: 'Cant find user'
    });
  }

  const courses = await Course.findByPk(req.params.course_id);

  await user.addCourses(courses);

  res.json({
    status: 'success',
    data: user
  });
});

exports.deleteUserCourse = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(400).json({
      message: 'Cant find user'
    });
  }

  const courses = await Course.findByPk(req.params.course_id);

  await user.removeCourses(courses);

  res.status(204).json();
});

exports.getFreeUsers = catchAsync(async (req, res, next) => {
  const course = await Course.findByPk(req.params.courseId);
  const users = await course.getUsers({attributes: ['id']});
  const usersId = users.map(el => el.id);
  const availableSlots = await Slot.findAll({
    where: {
      weekDay: req.params.weekDay,
      '$AppointmentType.name$': 'universal'
    },
    include: {
      model: User,
      where: {id: {[Op.in]: usersId}},
      attributes: ['id', 'name']
    },
    attributes: ['time']
  });
  res.json({availableSlots});
});

exports.getUsersForReplacementSubGroup = catchAsync(async (req, res, next) => {
  // userId, subGroupId
  const mentorCurrentSlots = await sequelize.query(
    `SELECT "Slots"."weekDay", "Slots"."time", "Slots"."startDate","Slots"."endDate" FROM "Slots" 
    WHERE "Slots"."SubGroupId" = :SubGroupId`,
    {
      replacements: {SubGroupId: req.params.subGroupId},
      type: Sequelize.QueryTypes.SELECT
    }
  );
  // const teachers = await sequelize.query(
  //   `SELECT "Users"."id","Users"."name", "Slots"."time" FROM "Users"
  //     JOIN "TeacherCourses" ON "Users"."id" = "TeacherCourses"."userId"
  //     JOIN "Slots" ON "Users"."id" = "Slots"."userId"
  //     WHERE "TeacherCourses"."courseId" = :courseId
  //     AND "Slots"."SubGroupId" = :SubGroupId`,
  //   {
  //     replacements: {courseId: req.query.courseId, SubGroupId: req.params.subGroupId},
  //     type: Sequelize.QueryTypes.SELECT,
  //     model: User
  //   }
  // );
  const allUsers = await TeacherCourse.findAll({
    where: {courseId: req.query.courseId},
    attributes: ['userId']
  });
  const userIds = await User.findAll({
    attributes: ['id'],
    include: [
      {
        model: Slot,
        attributes: [],
        where: {
          weekDay: {[Sequelize.Op.in]: mentorCurrentSlots.map(slot => slot.weekDay)},
          time: {[Sequelize.Op.in]: mentorCurrentSlots.map(slot => slot.time)},
          startDate: {[Sequelize.Op.lte]: mentorCurrentSlots[0].startDate},
          endDate: {[Sequelize.Op.gte]: mentorCurrentSlots[0].endDate}
        }
      }
    ]
  });

  res.status(200).json({allUsers, userIds, mentorCurrentSlots});
});
