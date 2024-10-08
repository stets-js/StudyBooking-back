const {format, sub} = require('date-fns');
const fs = require('fs');
const path = require('path');
const {Sequelize, Op} = require('sequelize');
const csv = require('csv-parser');

const factory = require('./factory.controller');
const {SubGroup, SubgroupMentor, User, TeacherType, Course} = require('../models/relation');

const catchAsync = require('../utils/catchAsync');
const translateCourse = require('../utils/zoho/courseTranslator');
const findCourseBySubgroupName = require('../utils/zoho/subgroupScrapper');
const generateNames = require('../utils/zoho/translateSubgroupName');

const sendEmail = require('../utils/email');
const sendTelegramNotification = require('../utils/sendTelegramNotification');
const {sendDirectMessage} = require('../utils/sendSlackNotification');
const {generateNotificationMessage} = require('../utils/generateNotificationMessage');
const {sendMessage} = require('../rabbitMQ/producer');

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
      const notificationMessage = generateNotificationMessage(req.body);
      if (user.slackId) {
        sendMessage('slack_queue', 'slack_group_confirm_subgroup', {
          channelId: 'C07DM1PERK8',
          text: 'Будеш працювати?\n' + notificationMessage,
          subgroupId: req.body.subgroupId,
          userSlackId: user.slackId,
          userId: user.id
        });
      }
      // if (user.telegramChatId && !(process.env.NODE_ENV === 'DEV'))
      //   await sendTelegramNotification(user.telegramChatId, notificationMessage);
      // if (user.slack) await sendDirectMessage(user.slack, notificationMessage);
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

exports.sendTelegram = (req, res, next) => {
  sendTelegramNotification(req.body.telegram, 'Hello?');
  res.status(200).json({message: 'sended'});
};

exports.addSubgroupsFromZoho = catchAsync(async (req, res, next) => {
  const data = req.body;
  let course = -1;
  const courseName = data.courseName;
  let msg = '';
  const translatedCourse = translateCourse(courseName);
  console.log(translatedCourse);
  if (translatedCourse.id === 110 || !translatedCourse.id) {
    const translatedSubgroup = findCourseBySubgroupName(data.subgroups[0].name);
    if (!translatedSubgroup) {
      await sendTelegramNotification(
        '-1002197881869',
        `Не вийшло знайти курс з зохо!\n${courseName} - ${JSON.stringify(
          data.subgroups.map(el => el.name)
        )}`
      );
    }
    msg = 'За допомогою скрапера назви';
    course = translatedSubgroup;
  } else {
    msg = 'За допомогою словника курсів';
    course = translatedCourse;
  }
  if (!course.id) {
    return res.status(400).json({message: 'Cant find this course in the system'});
  }
  const subgroupsData = data.subgroups || [];

  // if (!course) {
  //   course = await Course.create({name: courseName});
  // }

  subgroupsData.forEach(async subgroupData => {
    const subgroupName = subgroupData.name;
    const existingSubgroup = await SubGroup.findOne({
      where: {
        // CourseId: translatedCourse.id,
        name: subgroupName
      }
    });

    if (!existingSubgroup) {
      await SubGroup.create({
        name: subgroupName,
        startDate: subgroupData.startDate,
        endDate: subgroupData.endDate,
        link: subgroupData.link,
        description: subgroupData.description,
        CourseId: course.id
      });
      await sendTelegramNotification(
        '-1002197881869',
        `Завантажений поток з зохо!\n${subgroupName} - ${course.name}\n ${msg}`
      );
    } else {
      if (existingSubgroup.link !== subgroupData.link) {
        existingSubgroup.link = subgroupData.link;
        await existingSubgroup.save();
        await sendTelegramNotification(
          '-1002197881869',
          `Оновлено поток (лінку на телеграм)!\n${subgroupName} - ${course.name}`
        );
      }
    }
  });

  res.status(201).json({message: 'Course and subgroups added successfully.'});
});

exports.readCsvZohoSubgroups = catchAsync(async (req, res, next) => {
  const path = 'course_group.csv';
  let data = {found: 0, not: 0, course: 0, notCourse: 0, old: 0, notArr: []};
  const dataArr = [];
  fs.createReadStream(path)
    .pipe(csv())
    .on('data', async row => {
      const values = Object.values(row)[0].split(';');
      dataArr.push(values);
    })
    .on('end', async () => {
      await Promise.all(
        dataArr.map(async values => {
          if (1) {
            const endDateStr = values[values.length - 1]; // '05.07.2025'
            const [day, month, year] = endDateStr.split('.'); // Розділяємо день, місяць і рік
            const endDate = new Date(`${year}-${month}-${day}`); // Створюємо Date-об'єкт у форматі 'YYYY-MM-DD'

            const currentDate = new Date();

            if (endDate > currentDate) {
              data.old += 1;
            } else {
              // const course = translateCourse(row[0]);
              // if (!course) {
              //   data.notCourse += 1;
              // } else {
              //   data.course += 1;
              // }

              // console.log(generateNames(values[1]));
              const subgroup = await SubGroup.findOne({
                where: {
                  [Sequelize.Op.or]: generateNames(values[1])
                }
              });
              if (subgroup) data.found += 1;
              else {
                data.not += 1;
                data.notArr.push(values[1]);
              }
            }
          }
        })
      );
      res.json(data);
    })
    .on('error', err => {
      // Handle errors
      console.error('Error reading the CSV file', err);
    });
});
