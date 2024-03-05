const factory = require('./factory.controller');
const {SubGroup, Slot, User, Appointment_Type} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');

exports.getAllSubGroups = factory.getAll(SubGroup);

exports.getSubGroupById = catchAsync(async (req, res, next) => {
  const document = await SubGroup.findByPk(req.params.id, {
    include: [
      {
        model: Slot,
        attributes: ['id', 'time', 'weekDay'],
        include: {model: Appointment_Type, attributes: ['name']}
      },
      {
        model: User,
        as: 'Admin',
        attributes: ['name'],
        foreignKey: 'adminId'
      },
      {
        model: User,
        as: 'Mentor',
        attributes: ['name'],
        foreignKey: 'mentorId'
      }
    ],
    order: [
      [{model: Slot}, 'weekDay', 'ASC'],
      [{model: Slot}, 'time', 'ASC']
    ]
  });
  if (!document) {
    next(new AppError(`No document find with id ${req.params.id}`, 404));
    return;
  }
  res.json({
    status: 'success',
    data: document
  });
});

exports.createSubGroup = factory.createOne(SubGroup);

exports.deleteSubGroup = factory.deleteOne(SubGroup);

exports.updateSubGroup = factory.updateOne(SubGroup);
