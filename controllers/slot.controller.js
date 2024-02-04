const {Slot} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory.controller');

exports.getAllSlots = factory.getAll(Slot);

exports.getSlotById = factory.getOne(Slot);

exports.createSlot = factory.createOne(Slot);

exports.deleteSlot = factory.deleteOne(Slot);

exports.updateSlot = factory.updateOne(Slot);

exports.createUserSlot = catchAsync(async (req, res, next) => {
  const document = await Model.create({userId: req.params.userId, data: req.body.data});

  res.status(201).json({
    status: 'success',
    data: document
  });
});
