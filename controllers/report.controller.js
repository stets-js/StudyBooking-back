const Report = require('../models/report.model');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory.controller');

exports.getAllReports = catchAsync(async (req, res, next) => {
  let document;
  let attributes = {};
  const where = req.whereClause;
  if (!['undefined', 'null'].includes(req.query.status)) where.status = req.query.status;
  if (req.query.sheet && !['undefined', 'null'].includes(req.query.sheet))
    where.sheetName = req.query.sheet;
  if (!['undefined', 'null'].includes(req.query.course) && req.query.course) {
    if (Number.isNaN(Number(req.query.course))) where.course = req.query.course;
    else where.courseId = req.query.course;
  }
  console.log(where);
  document = await Report.findAll({
    where,
    attributes,
    order: [
      ['total', req?.query?.mark || 'ASC'],
      ['updatedAt', 'DESC']
    ],
    offset: req.query.offset,
    limit: req.query.limit
  });
  totalCount = await Report.count({
    where,
    attributes
  });

  return res.json({
    status: 'success',
    results: document.length,
    data: document,
    totalCount,
    where,
    newOffset: +req.query.offset + +req.query.limit
  });
});

exports.getReportById = factory.getOne(Report);

exports.createReport = factory.createOne(Report);

exports.deleteReport = factory.deleteOne(Report);

exports.updateReport = factory.updateOne(Report);
