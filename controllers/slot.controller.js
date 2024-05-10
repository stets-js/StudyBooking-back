const {Op} = require('sequelize');
const {addDays} = require('date-fns');
const {Slot, SubGroup, User, SubgroupMentor, TeacherType, Course} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory.controller');

exports.getAllSlots = catchAsync(async (req, res, next) => {
  let where = {};
  if (req.params.id || req.body.userIds) where.mentorId = req.params.id || req.body.userIds;
  const document = await Slot.findAll({
    where: req.whereClause,
    include: [
      {
        model: SubGroup,
        // attributes: []
        include: [
          Course,
          {
            model: User,
            as: 'Admin',
            attributes: ['name'],
            foreignKey: 'adminId',
            required: false
          },
          {
            model: SubgroupMentor,
            foreignKey: 'subgroupId',
            include: TeacherType,
            where,
            required: false
          }
        ]
      }
    ],
    order: [
      ['weekDay', 'ASC'],
      ['time', 'ASC']
    ]
  });

  return res.json({
    status: 'success',
    results: document.length,
    data: document
  });
});

exports.getSlotById = factory.getOne(Slot);

exports.createSlot = factory.createOne(Slot);

exports.deleteSlot = factory.deleteOne(Slot);

exports.updateSlot = factory.updateOne(Slot, {slot: true});

exports.deleteSlots = catchAsync(async (req, res, next) => {
  const document = await Slot.destroy({
    where: {userId: req.params.id, subgroupId: req.query.subgroupId}
  });

  if (!document)
    return res.status(400).json({message: 'No document find with id ' + req.params.id});
  res.status(204).json();
});

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
      if (futureSlot.appointmentTypeId === req.body.appointmentTypeId) {
        // if universal
        futureSlot.startDate = req.body.startDate;
        const doc = await futureSlot.save();

        return res
          .status(200)
          .json({message: 'success', message: 'updated future slot', data: doc});
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
      data: document
    });
  }
});

exports.bulkUpdate = catchAsync(async (req, res, next) => {
  if (!req.body.appointmentTypeId) {
    return res.status(400).json({message: 'error not enough info'});
  }
  // const universalId = await Appointment_Type.findOne({where: {name: 'universal'}});

  const bodyForUpdate = {
    appointmentTypeId: req.body.appointmentTypeId,
    startDate: req.body.startDate,
    endDate: req.body.endDate
  };
  if (req.body.ReplacementId) bodyForUpdate.ReplacementId = req.body.ReplacementId;
  else bodyForUpdate.subgroupId = req.body.subgroupId;
  const docs = await Slot.update(bodyForUpdate, {
    where: {
      weekDay: req.body.weekDay,
      time: {[Op.in]: req.body.time},
      userId: req.body.userId
    }
  });
  req.docs = docs;
  next();
});

exports.bulkRemove = catchAsync(async (req, res, next) => {
  // this func will remove slots under new subgroup
  const docs = await Slot.destroy({where: {...req.whereClause, time: {[Op.in]: req.body.time}}});
  next();
});

exports.bulkCreate = catchAsync(async (req, res, next) => {
  const docs = await Slot.bulkCreate(req.body);
  res.status(201).json({data: docs, body: req.body});
});

exports.bulkDeleteSlots = catchAsync(async (req, res, next) => {
  if (!req.body.time) {
    return res.status(400).json({message: 'error not enough info'});
  }

  const docs = await Slot.destroy({
    where: {
      weekDay: req.body.weekDay,
      time: {[Op.in]: req.body.time},
      userId: req.body.userId
    }
  });
  req.docs = docs;
  next();
});

exports.CreateSlotsAfterSubgroup = catchAsync(async (req, res, next) => {
  const universalId = 6; // !!!
  const endDateConverted = new Date(req.body.endDate);
  const endDateIndex = endDateConverted.getDay() - 1;
  const newStartDate = addDays(endDateConverted, 7 - (endDateIndex - 1 < 0 ? 6 : endDateIndex - 1));
  const slots = await (req.body.time || []).forEach(async el => {
    return await Slot.create({
      userId: req.body.userId,
      appointmentTypeId: universalId,
      weekDay: req.body.weekDay,
      startDate: newStartDate,
      time: el
    });
  });
  res.status(200).json({docs: req.docs, slots});
});
