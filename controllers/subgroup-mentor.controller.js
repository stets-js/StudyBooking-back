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
