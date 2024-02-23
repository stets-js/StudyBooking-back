const {Op} = require('sequelize');
const {addDays} = require('date-fns');
const {Slot, Appointment_Type} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory.controller');
exports.getAllSlots = factory.getAll(Slot, {slot: true});

exports.getSlotById = factory.getOne(Slot);

exports.createSlot = factory.createOne(Slot);

exports.deleteSlot = factory.deleteOne(Slot);

exports.updateSlot = factory.updateOne(Slot, {slot: true});

exports.createUserSlot = catchAsync(async (req, res, next) => {
  let endDate = req.body.endDate || null;
  const prevSlot = await Slot.findOne({
    where: {
      userId: req.params.id,
      appointmentTypeId: req.body.appointmentTypeId,
      weekDay: req.body.weekDay,
      time: req.body.time,
      endDate: {
        [Op.and]: [{[Op.gte]: req.body.prevWeekStart}, {[Op.lte]: req.body.prevWeekEnd}]
      }
    }
  });
  if (prevSlot) {
    prevSlot.endDate = null;
    const updatedPrevSlot = prevSlot.save();
    return res.status(200).json({status: 'success', message: 'updated', data: updatedPrevSlot});
  } else {
    //find slots in future
    const futureSlot = await Slot.findOne({
      where: {
        userId: req.params.id,
        weekDay: req.body.weekDay,
        time: req.body.time
      }
    });
    if (futureSlot) {
      if (futureSlot?.AppointmentType?.name === 'universal') {
        futureSlot.startDate = req.body.startDate;
        const doc = await futureSlot.save();
        return res.status(200).json({message: 'success', message: 'updated future slot', doc});
      } else {
        endDate = addDays(futureSlot.startDate, -1);
      }
    }
    const document = await Slot.create({
      userId: req.params.id,
      appointmentTypeId: req.body.appointmentTypeId,
      weekDay: req.body.weekDay,
      startDate: req.body.startDate,
      endDate: endDate,
      time: req.body.time
    });
    await document.reload();

    res.status(201).json({
      status: 'success',
      data: document,
      prevSlot
    });
  }
});

exports.bulkUpdate = catchAsync(async (req, res, next) => {
  if (!req.body.subgroup || !req.body.appointmentTypeId) {
    return res.status(400).json({message: 'error not enough info'});
  }
  const universalId = await Appointment_Type.findOne({where: {name: 'universal'}});
  const docs = await Slot.update(
    {
      SubGroupId: req.body.subgroup,
      appointmentTypeId: req.body.appointmentTypeId,
      startDate: req.body.startDate,
      endDate: req.body.endDate
    },
    {
      where: {
        weekDay: req.body.weekDay,
        time: {[Op.in]: req.body.time},
        userId: req.body.userId
      }
    }
  );
  const endDateConverted = new Date(req.body.endDate);
  const endDateIndex = endDateConverted.getDay() - 1;
  const newStartDate = addDays(endDateConverted, 7 - (endDateIndex - 1 < 0 ? 6 : endDateIndex - 1));
  await (req.body.time || []).forEach(async el => {
    return await Slot.create({
      userId: req.body.userId,
      appointmentTypeId: universalId.id,
      weekDay: req.body.weekDay,
      startDate: newStartDate,
      time: el
    });
  });
  res.status(200).json({docs});
});
