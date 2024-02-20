const {Op} = require('sequelize');
const {User, Course, Slot, Appointment_Type, TeacherCourse} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory.controller');

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
