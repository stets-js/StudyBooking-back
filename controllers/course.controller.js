const {Course, TeacherCourse} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory.controller');

exports.getAllCourses = factory.getAll(Course);

exports.getCourseById = factory.getOne(Course);

exports.createCourse = factory.createOne(Course);

exports.deleteCourse = factory.deleteOne(Course);

exports.updateCourse = factory.updateOne(Course);

exports.getTeachersForCourse = catchAsync(async (req, res, next) => {
  const where = {courseId: req.params.id};
  if (req.query.TeacherTypeId) {
    where.TeacherTypeId = req.query.TeacherTypeId;
  }
  const teachers = await TeacherCourse.findAll({
    where,
    attributes: ['userId']
  });
  res.status(200).json(teachers.map(record => record.userId));
});
