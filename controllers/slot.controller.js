const {Slot} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory.controller');

exports.getAllSlots = factory.getAll(Slot, {slot: true});

exports.getSlotById = factory.getOne(Slot);

exports.createSlot = factory.createOne(Slot);

exports.deleteSlot = factory.deleteOne(Slot);

exports.updateSlot = factory.updateOne(Slot, {slot: true});

exports.createUserSlot = catchAsync(async (req, res, next) => {
  const document = await Slot.create({
    userId: req.params.id,
    data: req.body.data,
    appointmentTypeId: req.body.appointmentTypeId,
    weekDay: req.body.weekDay,
    time: req.body.time
  });
  await document.reload();

  res.status(201).json({
    status: 'success',
    data: document
  });
});
