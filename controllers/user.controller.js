const {Op, Sequelize} = require('sequelize');
const jwt = require('jsonwebtoken');
const {format} = require('date-fns');

const {User, Course, Slot, TeacherCourse, TeacherType, Role} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory.controller');
const sequelize = require('../db');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  let document;
  let attributes = {exclude: ['password']};

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

  let includeOptions = [];
  if (req.query.onlyIndiv) {
    includeOptions.push({
      model: Slot,
      attributes: [],
      where: {appointmentTypeId: 2}, // indiv
      required: true
    });
  }
  if (req.query.courses) {
    // case of filtering users by courses
    const courseIds = JSON.parse(req.query.courses);
    if (courseIds.length > 0)
      includeOptions.push({
        model: Course,
        as: 'teachingCourses',
        where: {id: {[Op.in]: courseIds}}
      });
  }
  document = await User.findAll({
    // subQuery: false,
    where: req.whereClause,
    attributes,
    include: includeOptions,
    order: req.query.sortBySubgroups
      ? [
          [Sequelize.literal('"subgroupCount"'), 'ASC'],
          ['rating', 'DESC']
        ]
      : [['rating', 'DESC']],
    offset: req.query.offset,
    limit: req.query.limit
  });
  totalCount = await User.count({
    include: [...includeOptions, {model: Role, required: false}],
    where: req.whereClause,
    attributes
  });

  return res.json({
    status: 'success',
    results: document.length,
    data: document,
    totalCount,
    newOffset: +req.query.offset + document.length
  });
});

exports.getUserById = factory.getOne(User, [
  {
    model: Course,
    as: 'teachingCourses'
  }
]);

exports.createUser = catchAsync(async (req, res, next) => {
  req.body.password = (Math.random() + 1).toString(36).substring(7); // for preventing user to login in system without password
  const document = await User.create(req.body);
  req.User = document;
  next(); // next leads to reset password user goes to his/her email and only than can be logged in to the system
});

exports.deleteUser = factory.deleteOne(User);

exports.updateUser = catchAsync(async (req, res, next) => {
  let id = req.params.id;

  const body = req.body;
  delete body.password;
  let updatedDoc = await User.update(body, {where: {id}});

  res.json({
    data: updatedDoc
  });
});

exports.getUserCourses = catchAsync(async (req, res, next) => {
  const courses = await TeacherCourse.findAll({
    where: {userId: req.params.id},
    include: [
      {
        model: TeacherType
      }
    ]
  });

  res.json({
    status: 'success',
    data: courses
  });
});

exports.addUserCourse = catchAsync(async (req, res, next) => {
  const newTeacherCourse = await TeacherCourse.create(
    {userId: req.params.id, courseId: req.params.course_id},
    {include: TeacherType}
  );
  await newTeacherCourse.reload();
  res.json({
    status: 'success',
    data: newTeacherCourse
  });
});

exports.deleteUserCourse = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(400).json({
      message: 'Cant find user'
    });
  }

  const courses = await Course.findByPk(req.params.course_id);

  await user.removeTeachingCourse(courses);

  res.status(204).json();
});
exports.updateUserCourse = catchAsync(async (req, res, next) => {
  const teacherCourse = await TeacherCourse.update(req.body, {
    where: {courseId: req.params.course_id, userId: req.params.id}
  });
  res.status(201).json(teacherCourse);
});

exports.getFreeUsers = catchAsync(async (req, res, next) => {
  const {appointmentType} = req.query;
  const users = await TeacherCourse.findAll({
    where: {courseId: req.params.courseId}
  });
  const usersId = users.map(el => el.userId);
  const availableSlots = await Slot.findAll({
    where: {
      weekDay: req.params.weekDay,
      '$AppointmentType.name$': appointmentType
    },
    include: {
      model: User,
      where: {id: {[Op.in]: usersId}},
      attributes: ['id', 'name']
    },
    attributes: ['time']
  });
  res.json({availableSlots});
});

exports.getUsersForReplacementSubGroup = catchAsync(async (req, res, next) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const mentorCurrentSlots = await sequelize.query(
    `SELECT "Slots"."weekDay", "Slots"."time","Slots"."userId", "Slots"."startDate","Slots"."endDate" FROM "Slots"
    WHERE "Slots"."SubGroupId" = :SubGroupId`,
    {
      replacements: {SubGroupId: req.params.subGroupId},
      type: Sequelize.QueryTypes.SELECT
    }
  );
  const startCursor =
    today > mentorCurrentSlots[0].startDate ? today : mentorCurrentSlots[0].startDate;
  const allUsers = await User.findAll({
    where: {id: {[Op.ne]: mentorCurrentSlots[0].userId}},
    attributes: ['name', 'id'],
    include: [
      {
        association: 'teachingCourses',
        where: {id: req.query.courseId},

        attributes: []
      },
      {
        model: Slot,

        where: {
          weekDay: {[Op.in]: mentorCurrentSlots.map(slot => slot.weekDay)},
          time: {[Op.in]: mentorCurrentSlots.map(slot => slot.time)},
          startDate: {[Op.lte]: startCursor},
          endDate: {[Op.or]: [{[Op.gte]: mentorCurrentSlots[0].endDate}, {[Op.eq]: null}]}
        }

        // group here
      }
    ]
  });
  const structuredSlots = allUsers.map(user => {
    const structuredUser = {
      name: user.name,
      id: user.id,
      Role: user.Role,
      Slots: {}
    };

    user.Slots.forEach(slot => {
      if (!structuredUser.Slots[slot.weekDay]) {
        structuredUser.Slots[slot.weekDay] = [];
      }

      structuredUser.Slots[slot.weekDay].push({
        id: slot.id,
        time: slot.time,
        startDate: slot.startDate,
        endDate: slot.endDate,
        appointmentTypeId: slot.appointmentTypeId,
        userId: slot.userId,
        SubGroupId: slot.SubGroupId,
        ReplacementId: slot.ReplacementId
      });
    });

    return structuredUser;
  });

  res.status(200).json({data: allUsers, structuredSlots});
});

exports.addCoursesToUsersBulk = catchAsync(async (req, res, next) => {
  const users = req.body.emails;
  const courseId = req.body.courseId;
  users.forEach(async user => {
    const id = await User.findOne({where: {email: user}});
    const userCourse = await TeacherCourse.findOrCreate({
      where: {
        userId: id.id,
        courseId,
        TeacherTypeId: 3
      },
      defaults: {
        userId: id.id,
        courseId,
        TeacherTypeId: 3
      }
    });
  });
  res.status(201).json({message: 'created!'});
});

const sendEmail = require('../utils/email');

exports.sendEmailsBulk = catchAsync(async (req, res, next) => {
  const emails = req.body.emails;

  for (let i = 0; i < emails.length; i++) {
    const em = emails[i];

    // Wrapping the email sending process in a setTimeout to delay each email by 1 second
    await new Promise(resolve =>
      setTimeout(async () => {
        const resetToken = jwt.sign({email: em}, process.env.JWT_SECRET, {
          expiresIn: '7d'
        });
        const resetURL = `${
          // process.env.NODE_ENV === 'DEV' ? process.env.LOCAL_FRONT :
          process.env.DEPLOYED_FRONT
        }/resetPassword/${resetToken}`;

        const message = `Forgot password? Submit a patch request with your new password and password confirm to: ${resetURL}`;
        const html = `<h1>Forgot password?</h1><a href="${resetURL}"><button>Click here</button></a>`;

        await sendEmail({
          email: em,
          subject: 'Reset token (7 days)',
          message,
          html
        });

        resolve();
      }, i * 10)
    ); // Delay of i * 1000 milliseconds (1 second per email)
  }

  // Send response after all emails have been sent
  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!',
    data: req?.User
  });
});

exports.updateTelegramChatId = catchAsync(async (req, res, next) => {
  const doc = await User.update(
    {telegramChatId: req.body.telegramChatId},
    {where: {email: req.body.email}}
  );
  if (doc) {
    res.status(200).json({
      status: 'success',
      message: 'Updated!',
      data: doc
    });
  }
});
async function getCourseData(courseId) {
  const [results] = await sequelize.query(
    `
    SELECT
      u.name AS userName,
      u.email AS userEmail,
      u."createdAt" AS userCreatedAt,
      u."updatedAt" AS userUpdatedAt,
      c.name AS courseName
    FROM "Users" u
    JOIN "TeacherCourses" tc ON u.id = tc."userId"
    JOIN "Courses" c ON tc."courseId" = c.id
    WHERE c.id = :courseId AND
    u."updatedAt" > '2024-06-25' AND
          u."createdAt" != u."updatedAt" AND
          EXTRACT(EPOCH FROM (u."updatedAt" - u."createdAt")) > 180
  `,
    {
      replacements: {courseId}
    }
  );
  return results.map(row => [row.username, row.useremail, row.usercreatedat, row.userupdatedat]);
}
async function getAllCourses() {
  const courses = await Course.findAll({
    attributes: ['id', 'name'],
    where: {id: {[Op.in]: [117]}}
  });

  return courses;
}

const createSheetForCourse = require('../utils/spreadsheet/createNewSheet');
const uploadDataToGoogleSheet = require('../utils/spreadsheet/uploadData');
const loginToSheet = require('../utils/spreadsheet/loginToSheet');
const Logs = require('../models/log.model');

async function exportData() {
  const sheets = await loginToSheet();

  const spreadsheetId = '1FrBBGGz-fRqfeUuLzO1Jslqem6L0bogJ_qU_9m8zY14';
  const courses = await getAllCourses();
  for (const course of courses) {
    const courseData = await getCourseData(course.id);
    courseData.unshift(['User Name', 'User Email', 'Created At', 'Updated At']); // Додаємо заголовки таблиці

    // await createSheetForCourse(sheets, spreadsheetId, course.name);
    await uploadDataToGoogleSheet(sheets, spreadsheetId, course.name, courseData);
  }
}
exports.usersThatChangedPassword = async (req, res, next) => {
  await exportData();
  res.status(200).send('Data successfully exported to Google Sheet');
};
const endpointToActionMap = {
  '^/api/auth/login$': 'логін',
  '/api/subgroup-mentor': 'призначенно на потік',
  '/subgroups/\\d+$': 'Редагування потока',
  '^/api/subgroups': 'Створення потока',
  '^/api/lessons': 'Перегляд календаря',
  '/api/auth/forgotPassword': 'Скидання пароля',
  '^/api/users/\\d+/slots/\\d+$': 'Видалення слота',
  '^/api/users/\\d+/slots$': 'Виставляння слота',
  '^/api/users/\\d+': 'Редагування юзера',
  '/api/users/\\d+/courses/\\d+': 'Додавання курса до викладача'
  // Добавьте здесь другие соответствия
};

const getActionFromEndpoint = endpoint => {
  for (const pattern in endpointToActionMap) {
    if (new RegExp(pattern).test(endpoint)) {
      return endpointToActionMap[pattern];
    }
  }
  return null; // Вернуть null, если сопоставление не найдено
};
exports.getLogs = async (req, res, next) => {
  const logs = await Logs.findAll({
    where: {
      userId: {[Op.or]: [{[Op.ne]: 18}, {[Op.ne]: 129}]},
      path: {[Op.ne]: '/api/lessons/bulk'}
    },
    include: [
      {
        model: User,
        attributes: ['name', 'email']
      }
    ]
  });

  // Логин и загрузка данных в Google Sheets
  const sheets = await loginToSheet();
  const spreadsheetId = '1iNDkg4PglhR2KF7oKHfBUTBUOrjlK32ocMrDThrZbl0';

  const logDataByAction = {
    Other: [['User Name', 'User Email', 'Action', 'Method', 'Created At', 'Updated At']]
  };

  for (const log of logs) {
    const action = getActionFromEndpoint(log.path) || 'Other';
    if (!logDataByAction[action]) {
      logDataByAction[action] = [
        ['User Name', 'User Email', 'Action', 'Method', 'Created At', 'Updated At']
      ];
    }

    logDataByAction[action].push([
      log?.User?.name || undefined,
      log?.User?.email || log.body?.email || undefined,
      action,
      log.method,
      log.createdAt,
      log.updatedAt
    ]);
  }

  for (const [action, logData] of Object.entries(logDataByAction)) {
    await createSheetIfNotExists(sheets, spreadsheetId, action);
    await uploadDataToGoogleSheet(sheets, spreadsheetId, action, logData);
  }

  res.status(200).json(logs);
};

// Функция для создания листа, если он не существует
async function createSheetIfNotExists(sheets, spreadsheetId, sheetTitle) {
  const {data} = await sheets.spreadsheets.get({
    spreadsheetId
  });

  const sheetExists = data.sheets.some(sheet => sheet.properties.title === sheetTitle);

  if (!sheetExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetTitle
              }
            }
          }
        ]
      }
    });
  }
}
