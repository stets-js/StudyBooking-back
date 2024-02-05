const {Slot} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory.controller');

exports.getAllSlots = factory.getAll(Slot);

exports.getSlotById = factory.getOne(Slot);

exports.createSlot = factory.createOne(Slot);

exports.deleteSlot = factory.deleteOne(Slot);

exports.updateSlot = factory.updateOne(Slot, {slot: true});

exports.createUserSlot = catchAsync(async (req, res, next) => {
  const document = await Slot.create({
    userId: req.params.id,
    data: req.body.data,
    appointmentTypeId: req.body.appointmentTypeId
  });
  const createdDocument = await Slot.findOne({
    where: {id: document.id}
  });
  res.status(201).json({
    status: 'success',
    data: createdDocument
  });
});
