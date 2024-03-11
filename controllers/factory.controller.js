const {Op, literal} = require('sequelize');
const {format, sub} = require('date-fns');
const {User, SubGroup, Replacement, Course} = require('../models/relation');
const catchAsync = require('./../utils/catchAsync');
const sequelize = require('../db');
const sendEmail = require('../utils/email');

const generateWhereClause = require('../utils/whereClauseGenerator');

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
    if (Model === SubGroup) {
      await Course.increment({group_amount: -1}, {where: {id: document.CourseId}});
      await Replacement.destroy({where: {SubGroupId: id}});
    }
    if (!document)
      return res.status(400).json({message: 'No document find with id ' + req.params.id});
    await document.destroy();
    res.status(204).json();
  });

exports.createOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    if (Model === SubGroup || Model === Replacement) {
      let message = '';
      let subject = '';
      if (Model === SubGroup) {
        message = `<div styles="font-family:"Poppins", sans-serif; font-size:20px;><h3>Потік під назвою ${
          req.body.name
        } створено!<h3>
      <h4>Дата ${format(req.body.startDate, 'yyyy-MM-dd')}, - ${format(
          req.body.endDate,
          'yyyy-MM-dd'
        )}</h4>
      <div>Графік ${req.body.schedule}.<br>
      Посилання: ${req.body.link}.<br>
      Опис: ${req.body.description}.<br></div></div>
     `;
        subject = 'У Вас новий потік';

        await Course.increment({group_amount: 1}, {where: {id: req.body.CourseId}});
      } else {
        message = `<div styles="font-family:"Poppins", sans-serif; font-size:20px;><h2>Була назначена заміна, перевірте свій календар.</h2>
        <h3>Повідомленя до заміни: ${req.body.description}</h3></div>`;
        subject = 'У Вас нова заміна';
      }
      try {
        const user = await User.findByPk(req.body.userId || req.body.mentorId);
        if (user) {
          await sendEmail({
            email: user.email,
            subject,
            html: message
          });
        }
      } catch (e) {}
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

    document = await Model.findAll({
      where: req.whereClause,
      attributes: {exclude: [Model === User ? 'password' : '']},
      order: Model === User ? [['rating', 'DESC']] : []
    });
    return res.json({
      cl: req.whereClause,
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
