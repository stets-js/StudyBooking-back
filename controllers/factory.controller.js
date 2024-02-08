const Role = require('../models/relation');
const catchAsync = require('./../utils/catchAsync');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    let id = req.params.id;
    if (req.params.slotId) {
      id = req.params.slotId;
    }
    const document = await Model.destroy({where: {id}});
    if (!document)
      return res.status(400).json({message: 'No document find with id ' + req.params.id});
    res.status(204).json();
  });

exports.createOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: document
    });
  });

exports.getOne = Model =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByPk(req.params.id);
    if (!document) {
      next(new AppError(`No document find with id ${req.params.id}`, 404));
      return;
    }
    res.json({
      status: 'success',
      data: document
    });
  });

exports.getAll = (Model, options) =>
  catchAsync(async (req, res, next) => {
    let document;
    let whereClause = {};

    if (req.query.role) whereClause['$Role.name$'] = req.query.role;
    if (req.query.userId) whereClause[userId] = req.query.role;
    if (options && options.slot) {
      whereClause.userId = req.params.id;
    }
    document = await Model.findAll({where: whereClause});

    res.json({
      status: 'success',
      results: document.length,
      data: document
    });
  });

exports.updateOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    let id = req.params.id;
    if (req.params.slotId) {
      id = req.params.slotId;
    }
    let updatedDoc = await Model.update(req.body, {where: {id}});
    if (req.params.slotId) {
      updatedDoc = await Model.findByPk(id);
    }
    res.json({
      data: updatedDoc
    });
  });
