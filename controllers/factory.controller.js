const Role = require('../models/relation');
const catchAsync = require('./../utils/catchAsync');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const document = await Model.destroy({where: {id: req.params.id}});
    if (!document)
      return res.status(400).json({message: 'No document find with id ' + req.params.id});
    res.status(204).json();
  });

exports.createOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    if (options && options.checkRole) {
    }
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

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    let document;
    if (req.query.role) {
      document = await Model.findAll({
        where: {
          '$Role.name$': req.query.role
        }
      });
    } else {
      document = await Model.findAll({});
    }
    res.json({
      status: 'success',
      results: document.length,
      data: document
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.update(req.body, {where: {id: req.params.id}});
    res.json({
      data: updatedDoc
    });
  });
