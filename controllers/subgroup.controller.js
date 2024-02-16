const factory = require('./factory.controller');
const {SubGroup} = require('../models/relation');

exports.getAllSubGroups = factory.getAll(SubGroup);

exports.getSubGroupById = factory.getOne(SubGroup);

exports.createSubGroup = factory.createOne(SubGroup);

exports.deleteSubGroup = factory.deleteOne(SubGroup);

exports.updateSubGroup = factory.updateOne(SubGroup);
