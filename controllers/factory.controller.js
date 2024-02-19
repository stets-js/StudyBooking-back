const {Op} = require('sequelize');
const {Role, User} = require('../models/relation');
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
    if (req.query.name) whereClause['name'] = req.query.name;
    if (req.query.role) whereClause['$Role.name$'] = req.query.role;
    if (req.query.userId) whereClause[userId] = req.query.role;
    if (req.query.users) whereClause['$User.id$'] = {[Op.in]: JSON.parse(req.query.users)};
    if (req.body.userIds) {
      whereClause.userId = {[Op.in]: req.body.userIds};
      whereClause['$AppointmentType.name$'] = 'universal';
    }
    if (options && options.slot && req.params.id) {
      whereClause.userId = req.params.id;
    }
    document = await Model.findAll({
      where: whereClause,
      order: Model === User ? [['rating', 'DESC']] : []
    });

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
    console.log(id);
    let updatedDoc = await Model.update(req.body, {where: {id}});
    if (req.params.slotId) {
      updatedDoc = await Model.findByPk(id);
    }
    res.json({
      data: updatedDoc
    });
  });
