const {TeacherType} = require('../models/relation');
const factory = require('./factory.controller');

exports.getAllTeacherTypes = factory.getAll(TeacherType);

exports.getTeacherTypeById = factory.getOne(TeacherType);

exports.createTeacherType = factory.createOne(TeacherType);

exports.deleteTeacherType = factory.deleteOne(TeacherType);

exports.updateTeacherType = factory.updateOne(TeacherType);
