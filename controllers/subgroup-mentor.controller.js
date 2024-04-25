const {SubGroup, User, SubgroupMentor, Course} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory.controller');
exports.getAllSubgroupsMentor = catchAsync(async (req, res, next) => {
  const document = await SubgroupMentor.findAll({
    where: req.whereClause,
    include: [
      {
        model: SubGroup,
        include: [
          {
            model: User,
            as: 'Admin',
            attributes: ['name'],
            foreignKey: 'adminId'
          },
          Course
        ]
      }
    ]
  });

  return res.json({
    status: 'success',
    results: document.length,
    data: document
  });
});

exports.createSubgroupMentor = factory.createOne(SubgroupMentor);

exports.deleteSubgroupMentor = catchAsync(async (req, res, next) => {
  const document = await SubgroupMentor.findOne({
    where: {mentorId: req.params.mentorId, subgroupId: req.params.subgroupId}
  });

  if (!document)
    return res.status(400).json({message: 'No document find with id ' + req.params.id});
  await document.destroy();
  res.status(204).json();
});
