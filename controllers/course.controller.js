const {Sequelize, Op} = require('sequelize');
const {Course, TeacherCourse} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory.controller');

exports.getAllCourses = catchAsync(async (req, res, next) => {
  const document = await Course.findAll({
    where: req.whereClause
  });

  return res.json({
    status: 'success',
    results: document.length,
    data: document
  });
});

exports.getCourseById = catchAsync(async (req, res, next) => {
  const attributes = {
    include: [
      [
        Sequelize.literal(
          `(SELECT COUNT(*) FROM "SubGroups" WHERE "SubGroups"."CourseId" =${req.params.id})`
        ),
        'group_amount'
      ]
    ]
  };
  const document = await Course.findOne({where: {id: req.params.id}, attributes});
  if (!document) {
    return res.status(404).json({message: `No document find with id ${req.params.id}`});
  }
  res.json({
    status: 'success',
    data: document
  });
});

exports.createCourse = factory.createOne(Course);

exports.deleteCourse = factory.deleteOne(Course);

exports.updateCourse = factory.updateOne(Course);

exports.getTeachersForCourse = catchAsync(async (req, res, next) => {
  const where = {courseId: req.params.id};
  if (req.query.TeacherTypeId) {
    where.TeacherTypeId = {[Op.or]: [req.query.TeacherTypeId, 3]}; // 3 - is ulti
  }
  const teachers = await TeacherCourse.findAll({
    where,
    attributes: ['userId'],
    order: [['TeacherTypeId', 'ASC']]
  });
  res.status(200).json(teachers.map(record => record.userId));
});
