const {Course} = require('../models/relation');
const factory = require('./factory.controller');

exports.getAllCourses = factory.getAll(Course);

exports.getCourseById = factory.getOne(Course);

exports.createCourse = factory.createOne(Course);

exports.deleteCourse = factory.deleteOne(Course);

exports.updateCourse = factory.updateOne(Course);
