const {Op, literal} = require('sequelize');
const {User, SubGroup} = require('../models/relation');
const catchAsync = require('./../utils/catchAsync');
const sequelize = require('../db');

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
    if (Model === SubGroup) {
      message = ```
      Потік під назвою ${req.body.name} створено!
      Дата початку ${req.body.startDate}, кінець потоку - ${req.body.endDate}.
      Графік ${req.body.schedule}.
      Посилання: ${req.body.link}.
      Опис: ${req.body.description}.
      ```;
      try {
        const user = await User.findByPk(req.body.userId);
        if (user) {
          await sendEmail({
            email: user.email,
            subject: 'У вас новий потік',
            message
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

    if (req.query.name) whereClause['name'] = {[Op.iLike]: `%${req.query.name}%`};

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
    if (req.query.startDate) {
      whereClause.startDate = {
        [Op.lte]: new Date(req.query.endDate)
      };

      whereClause.endDate = {
        [Op.or]: [
          {[Op.eq]: null},
          // req.query.endDate
          //   ? {
          {[Op.gte]: new Date(req.query.startDate)}
          //     }
          //   : {}
        ]
      };
    }

    if (req.query.teachersFilter && req.query.courses) {
      // I am sorry, but i killed more than 3 hours trying to get users -> teachersCourses <- courses
      // association, so its corner case with pure SQL
      // Filtering by courses for teachers

      const courseIdList = req.query.courses ? JSON.parse(req.query.courses) : [];
      const userNameLike = req.query.name ? `%${req.query.name}%` : null;

      const result = await sequelize.query(
        `
          SELECT "Users"."id", "Users"."name", "Users"."rating","Users"."email"
          FROM "Users"
          JOIN "TeacherCourses" ON "Users"."id" = "TeacherCourses"."userId"
          JOIN "Courses" ON "TeacherCourses"."courseId" = "Courses"."id"
          WHERE "Users"."RoleId" = 1
            ${
              courseIdList.length > 0
                ? 'AND ARRAY(SELECT "courseId" FROM "TeacherCourses" WHERE "userId" = "Users"."id") @> ARRAY[:courseIds]'
                : ''
            }
            ${userNameLike ? 'AND "Users"."name" iLIKE :userName' : ''}
          GROUP BY "Users"."id"
          ORDER BY "Users"."rating" DESC
          `,
        {
          replacements: {
            courseIds: courseIdList,
            courseCount: courseIdList.length,
            userName: userNameLike
          },
          type: sequelize.QueryTypes.SELECT
        }
      );
      return res.status(200).json({
        message: 'success',
        data: result
      });
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
