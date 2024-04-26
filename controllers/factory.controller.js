const {Op, literal, Sequelize} = require('sequelize');
const {User, SubGroup, Replacement, Course, Slot} = require('../models/relation');
const catchAsync = require('./../utils/catchAsync');

const sendEmail = require('../utils/email');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    let id = req.params.id;
    if (req.params.slotId) {
      id = req.params.slotId;
    }
    const document = await Model.findByPk(id);
    if (Model === User) {
      const roleLevel = ['superAdmin', 'administrator', 'teacher'];
      if (roleLevel.indexOf(req.user.Role.name) > roleLevel.indexOf(document.Role.name))
        return res.status(400).json({message: 'You dont have right to delete this user.'});
    }

    if (!document)
      return res.status(400).json({message: 'No document find with id ' + req.params.id});
    await document.destroy();
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
      return res.status(404).json({message: `No document find with id ${req.params.id}`});
    }
    res.json({
      status: 'success',
      data: document
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    let document;
    let attributes = {
      exclude: [Model === User ? 'password' : '']
    };
    if (req.query.sortBySubgroups)
      // contains soft-tech
      attributes.include = [
        [
          Sequelize.literal(
            `(SELECT COUNT(*) FROM "SubgroupMentors" WHERE "SubgroupMentors"."mentorId" = "User"."id")`
          ),
          'subgroupCount'
        ]
      ];
    document = await Model.findAll({
      where: req.whereClause,
      attributes,
      order:
        Model === User
          ? req.query.sortBySubgroups
            ? [
                [Sequelize.literal('"subgroupCount"'), 'ASC'],
                ['rating', 'DESC']
              ]
            : [['rating', 'DESC']]
          : [],
      offset: req.query.offset,
      limit: req.query.limit
    });

    return res.json({
      status: 'success',
      results: document.length,
      data: document,
      newOffset: +req.query.offset + +req.query.limit
    });
  });

exports.updateOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    let id = req.params.id;
    if (req.params.slotId) {
      id = req.params.slotId;
    }
    const body = req.body;
    if (Model === User) delete body.password;
    let updatedDoc = await Model.update(body, {where: {id}});
    if (req.params.slotId) {
      updatedDoc = await Model.findByPk(id);
    }
    res.json({
      data: updatedDoc
    });
  });
