const factory = require('./factory.controller');
const {
  SubGroup,
  Slot,
  User,
  Appointment_Type,
  Course,
  SubgroupMentor
} = require('../models/relation');
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

exports.updateSubGroup = catchAsync(async (req, res, next) => {
  // for now its updating subgroup + creating new row in SubgroupMentor
  let id = req.params.id;

  const body = req.body;
  const subgroup = await SubGroup.update(body, {where: {id}});
  const subgroupMentor = await SubgroupMentor.create(req.body);
  res.json({
    data: subgroup,
    subgroupMentor
  });
});
