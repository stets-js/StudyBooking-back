const {Op, Sequelize} = require('sequelize');
const {User, Course, Slot, Appointment_Type, TeacherCourse} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory.controller');
const sequelize = require('../db');
const {format} = require('date-fns');

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
  const courses = await user.getTeachingCourses();

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

  await user.addTeachingCourse(courses);

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

  await user.removeTeachingCourse(courses);

  res.status(204).json();
});

exports.getFreeUsers = catchAsync(async (req, res, next) => {
  const users = await TeacherCourse.findAll({
    where: {courseId: req.params.courseId}
  });
  const usersId = users.map(el => el.userId);
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
  const today = format(new Date(), 'yyyy-MM-dd');
  const mentorCurrentSlots = await sequelize.query(
    `SELECT "Slots"."weekDay", "Slots"."time","Slots"."userId", "Slots"."startDate","Slots"."endDate" FROM "Slots"
    WHERE "Slots"."SubGroupId" = :SubGroupId`,
    {
      replacements: {SubGroupId: req.params.subGroupId},
      type: Sequelize.QueryTypes.SELECT
    }
  );
  const startCursor =
    today > mentorCurrentSlots[0].startDate ? today : mentorCurrentSlots[0].startDate;
  const allUsers = await User.findAll({
    where: {id: {[Op.ne]: mentorCurrentSlots[0].userId}},
    attributes: ['name', 'id'],
    include: [
      {
        association: 'teachingCourses',
        where: {id: req.query.courseId},

        attributes: []
      },
      {
        model: Slot,

        where: {
          weekDay: {[Op.in]: mentorCurrentSlots.map(slot => slot.weekDay)},
          time: {[Op.in]: mentorCurrentSlots.map(slot => slot.time)},
          startDate: {[Op.lte]: startCursor},
          endDate: {[Op.or]: [{[Op.gte]: mentorCurrentSlots[0].endDate}, {[Op.eq]: null}]}
        }

        // group here
      }
    ]
  });
  const structuredSlots = allUsers.map(user => {
    const structuredUser = {
      name: user.name,
      id: user.id,
      Role: user.Role,
      Slots: {}
    };

    user.Slots.forEach(slot => {
      if (!structuredUser.Slots[slot.weekDay]) {
        structuredUser.Slots[slot.weekDay] = [];
      }

      structuredUser.Slots[slot.weekDay].push({
        id: slot.id,
        time: slot.time,
        startDate: slot.startDate,
        endDate: slot.endDate,
        appointmentTypeId: slot.appointmentTypeId,
        userId: slot.userId,
        SubGroupId: slot.SubGroupId,
        ReplacementId: slot.ReplacementId
      });
    });

    return structuredUser;
  });

  res.status(200).json({data: allUsers, structuredSlots});
});
