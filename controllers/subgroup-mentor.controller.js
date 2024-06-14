const {SubGroup, User, SubgroupMentor, Course} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');

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

exports.createSubgroupMentor = catchAsync(async (req, res, next) => {
  const document = await SubgroupMentor.create(req.body);
  // await document.reload({include: User}); // uncomment when merge with lms
  // sendMessage(
  //   {subgroupId: document.subgroupId, mentorEmail: document.User.email},
  //   {topic: 'subscribed-mentor'}
  // );

  res.status(201).json({
    status: 'success',
    data: document
  });
});

exports.deleteSubgroupMentor = catchAsync(async (req, res, next) => {
  const document = await SubgroupMentor.findOne({
    where: {mentorId: req.params.mentorId, subgroupId: req.params.subgroupId}
  });

  if (!document)
    return res.status(400).json({message: 'No document find with id ' + req.params.id});
  await document.destroy();
  res.status(204).json();
});

exports.updateSubgroupMentor = catchAsync(async (req, res, next) => {
  const doc = await SubgroupMentor.update(req.body.body, {where: req.body.condition});
  res.status(200).json(doc);
});
