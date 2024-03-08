const {Replacement} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory.controller');

exports.getAllReplacements = catchAsync(async (req, res, next) => {
  let document;
  let whereClause = {};

  if (req.query.CourseId) whereClause['$SubGroup.CourseId$'] = req.query.CourseId;

  document = await Replacement.findAll({
    where: whereClause
  });
  res.json({
    status: 'success',
    results: document.length,
    data: document
  });
});

exports.getReplacementById = factory.getOne(Replacement);

exports.createReplacement = factory.createOne(Replacement);

exports.deleteReplacement = factory.deleteOne(Replacement);

exports.updateReplacement = factory.updateOne(Replacement);
