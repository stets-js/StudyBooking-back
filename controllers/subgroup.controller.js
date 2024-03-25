const factory = require('./factory.controller');
const {SubGroup, Slot, User, Appointment_Type, Course} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');

exports.getAllSubGroups = factory.getAll(SubGroup);

exports.getSubGroupById = catchAsync(async (req, res, next) => {
  const document = await SubGroup.findByPk(req.params.id);
  if (!document) {
    return res.status(404).json({message: `No document find with id ${req.params.id}`});
  }
  res.json({
    status: 'success',
    data: document
  });
});

exports.createSubGroup = factory.createOne(SubGroup);

exports.deleteSubGroup = factory.deleteOne(SubGroup);

exports.updateSubGroup = factory.updateOne(SubGroup);
