const User = require('../models/user.model');
const catchAsync = require('./../utils/catchAsync');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const document = await Model.deleteOne(req.params.id);
    if (!document) res.status(400).json({message: 'No document find with id ' + req.params.id});
    res.status(204).json();
  });

exports.createOne = Model =>
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

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findAll({});
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
