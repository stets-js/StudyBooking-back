const {format, sub} = require('date-fns');
const fs = require('fs');
const path = require('path');

const factory = require('./factory.controller');
const {SubGroup, SubgroupMentor, User, TeacherType, Course} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');
const sendTelegramNotification = require('../utils/sendTelegramNotification');

exports.getAllSubGroups = catchAsync(async (req, res, next) => {
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

  const document = await SubGroup.findAll({
    where: req.whereClause,
    offset: req.query.offset,
    limit: req.query.limit
  });
  totalCount = await SubGroup.count({
    where: req.whereClause
  });

  return res.json({
    status: 'success',
    results: document.length,
    data: document,
    totalCount,
    newOffset: +req.query.offset + +req.query.limit
  });
});

exports.getSubGroupById = catchAsync(async (req, res, next) => {
  const document = await SubGroup.findOne({
    where: {id: req.params.id},
    include: [
      {
        model: SubgroupMentor,
        required: false,
        include: [User, TeacherType]
      }
    ]
  });
  if (!document) {
    return res.status(404).json({message: `No document find with id ${req.params.id}`});
  }
  res.json({
    status: 'success',
    data: document
  });
});

exports.createSubGroup = factory.createOne(SubGroup);

exports.deleteSubGroup = factory.deleteOne(SubGroup);

exports.updateSubGroupAndNext = catchAsync(async (req, res, next) => {
  // for now its updating subgroup + creating new row in SubgroupMentor
  let id = req.params.id;
  const body = req.body;
  const subgroup = await SubGroup.update(body, {where: {id}});
  req.subgroup = subgroup;

  next();
});

exports.addMentorToSubgroup = catchAsync(async (req, res, next) => {
  const subgroupMentor = await SubgroupMentor.create(req.body);
  let message = '';
  let subject = '';
  message = `<div styles="font-family:"Poppins", sans-serif; font-size:20px;><h3>Вас було призначено на потік ${
    req.body.subgroupName
  }!<h3>
    <h4>Дата ${format(req.body.startDate, 'yyyy-MM-dd')}, - ${format(
    req.body.endDate,
    'yyyy-MM-dd'
  )}</h4>
    <div>Ваш графік: ${req.body.schedule}.<br>
    Посилання: ${req.body.link}.<br>
   </div>
    </div>
   `;
  subject = 'Вас призначенно на новий потік!';

  try {
    const user = await User.findByPk(subgroupMentor.mentorId);
    if (user) {
      await sendEmail({
        email: user.email,
        subject,
        html: message
      });
      if (user.telegramChatId) await sendTelegramNotification(user.telegramChatId, req.body);
    }
  } catch (e) {
    console.error(e);
  }
  res.json({
    data: req.subgroup,
    subgroupMentor
  });
});

exports.updateSubGroup = catchAsync(async (req, res, next) => {
  // for now its updating subgroup
  let id = req.params.id;
  const body = req.body;
  const subgroup = await SubGroup.update(body, {where: {id}});

  res.json({
    data: subgroup
  });
});

exports.subgroupJSON = catchAsync(async (req, res, next) => {
  const subgroup = await SubGroup.findOne({
    where: {id: req.params.id},
    include: [
      // {
      //   // model: User,
      //   // as: 'Admin',
      //   // attributes: ['name'],
      //   // foreignKey: 'adminId',
      //   // required: false
      // },
      {
        model: SubgroupMentor,
        foreignKey: 'subgroupId',
        include: [TeacherType, {model: User, attributes: {exclude: ['password']}}],
        required: false
      }
    ]
  });
  const filePath = path.join(__dirname, 'data.json');
  fs.writeFileSync(filePath, JSON.stringify(subgroup));

  // Отправляем файл клиенту
  res.download(filePath, 'data.json', err => {
    if (err) {
      res.status(500).send('Ошибка при отправке файла');
    } else {
      // Удаляем временный файл после отправки
      fs.unlinkSync(filePath);
    }
  });
});
