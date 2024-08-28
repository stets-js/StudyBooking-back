const {Op, Sequelize} = require('sequelize');
const jwt = require('jsonwebtoken');
const {format} = require('date-fns');

const {
  User,
  Course,
  Slot,
  TeacherCourse,
  TeacherType,
  Role,
  TeamLeadMentor
} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory.controller');
const sequelize = require('../db');
const {sendGroupMessage, getUserIdByName} = require('../utils/sendSlackNotification');
exports.tmpSendGroupSlack = async (req, res, next) => {
  const userId = await getUserIdByName('Mykhailo Onyshchenko');
  const resa = sendGroupMessage('testingbot', `<@${userId}>, hello bro. I am alive!! HELP ME`);
  res.json(resa);
};
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
  if (req.query.adminId) {
    includeOptions.push({
      model: TeamLeadMentor,
      as: 'MentorTeams',
      where: {adminId: req.query.adminId},
      required: true
    });
  }
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
    include: [...includeOptions, {model: Role, where: {name: req.query.role}}],
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
    include: [...includeOptions, {model: Role, where: {name: req.query.role}}],
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
  },
  {
    model: TeamLeadMentor,
    include: {model: User, as: 'Admin', attributes: ['name', 'id']},
    as: 'MentorTeams'
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
  const {appointmentType, teacherType} = req.query;
  let teacherCourseWhere = {courseId: req.params.courseId};
  if (+teacherType === 1) {
    teacherCourseWhere.TeacherTypeId = 1;
  } else teacherCourseWhere = {TeacherTypeId: [2, 3], ...teacherCourseWhere};
  const users = await TeacherCourse.findAll({
    where: teacherCourseWhere
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
  res.json({availableSlots, teacherCourseWhere});
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
  await Promise.all(
    users.map(async user => {
      const freshUser = await User.findOne({where: {email: user}});
      const where = courseId !== -1 ? {id: courseId} : {};
      const courses = await Course.findAll({where: where});
      await Promise.all(
        courses.map(async course => {
          await TeacherCourse.findOrCreate({
            where: {
              userId: freshUser.id,
              courseId: course.id,
              TeacherTypeId: 1
            },
            defaults: {
              userId: freshUser.id,
              courseId: course.id,
              TeacherTypeId: 1
            }
          });
        })
      );
    })
  );
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
const createSheetIfNotExists = require('../utils/spreadsheet/createSheetIfNotExists');
const clearSheet = require('../utils/spreadsheet/clearSheet');

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

exports.referaUsers = catchAsync(async (req, res, next) => {
  const sheets = await loginToSheet();
  const spreadsheetId = '1oWDWLZo0IuOR4UvmcjGzxk-2HWubNI2qaXTWDhyfhYY';

  const users = await User.findAll({
    where: {RoleId: 1},
    attributes: ['name', 'phone', 'telegram', 'slack', 'updatedAt'],
    order: [
      ['updatedAt', 'DESC'],
      ['phone', 'ASC']
    ]
  });

  const rows = [['ФІО', 'Телефон', 'Телеграм', 'Slack', 'updatedAt']];
  users.forEach(user => {
    rows.push([user.name, user.phone, user.telegram, user.slack, user.updatedAt]);
  });

  try {
    await clearSheet(sheets, spreadsheetId, 'users');
    await uploadDataToGoogleSheet(sheets, spreadsheetId, 'users', rows);
  } catch (error) {
    res.status(500).json({message: 'Квота за хвилину достигнута'});
  }
  res.json({message: 'Успішно оновили дані'});
});

exports.allUsersStats = catchAsync(async (req, res, next) => {
  const sheets = await loginToSheet();
  const spreadsheetId = '1R23wuCk86AKCP4KJOyEQTjcZd7e9DKRCyyS2El9MWsA';
  const registeredTeachersCount = await User.count({
    where: {RoleId: 1}
  });

  // 2. Количество преподавателей, которые изменили пароль
  const changedPasswordTeachersCount = await User.count({
    where: {
      RoleId: 1,
      [Op.and]: [
        Sequelize.where(
          Sequelize.fn('AGE', Sequelize.col('updatedAt'), Sequelize.col('createdAt')),
          {[Op.gt]: '00:03:00'} // больше 3 минут
        )
      ]
    }
  });

  // 3. Количество активных пользователей
  const activeTeachersCount = await User.count({
    where: {
      RoleId: 1,
      [Op.or]: [
        {id: {[Op.in]: Sequelize.literal('(SELECT DISTINCT "userId" FROM "Slots")')}},
        {id: {[Op.in]: Sequelize.literal('(SELECT DISTINCT "mentorId" FROM "Lessons")')}}
      ]
    }
  });

  const rows = [
    ['Усього вчителів', 'Які змінили пароль', 'Активні вчителі'],
    [registeredTeachersCount, changedPasswordTeachersCount, activeTeachersCount]
  ];
  try {
    await clearSheet(sheets, spreadsheetId, 'All');
    await uploadDataToGoogleSheet(sheets, spreadsheetId, 'All', rows);
  } catch (error) {
    res.status(500).json({message: 'Квота за хвилину достигнута'});
  }
  res.json({
    registeredTeachersCount,
    changedPasswordTeachersCount,
    activeTeachersCount
  });
});

exports.allUsersStatsByCourse = catchAsync(async (req, res, next) => {
  const sheets = await loginToSheet();
  const spreadsheetId = '1R23wuCk86AKCP4KJOyEQTjcZd7e9DKRCyyS2El9MWsA';
  const courseId = req.query.courseId;
  let where = {};
  if (courseId) where.id = courseId;
  const courses = await Course.findAll({where});
  const courseStats = await Promise.all(
    courses.map(async course => {
      // 1. Количество зарегистрированных преподавателей для каждого курса
      const registeredTeachersCount = await User.count({
        include: [
          {
            model: Course,
            as: 'teachingCourses',
            through: {
              where: {
                TeacherTypeId: {
                  [Op.ne]: 1
                }
              }
            },
            where: {id: course.id}
          }
        ],
        where: {RoleId: 1}
      });

      // 2. Количество преподавателей, которые изменили пароль для каждого курса
      const changedPasswordTeachersCount = await User.count({
        include: [
          {
            model: Course,
            as: 'teachingCourses',
            through: {
              where: {
                TeacherTypeId: {
                  [Op.ne]: 1
                }
              }
            },
            where: {id: course.id}
          }
        ],
        where: {
          RoleId: 1,
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn('AGE', Sequelize.col('User.updatedAt'), Sequelize.col('User.createdAt')),
              {[Op.gt]: '00:03:00'} // больше 3 минут
            )
          ]
        }
      });

      // 3. Количество активных пользователей для каждого курса
      const activeTeachersCount = await User.count({
        include: [
          {
            model: Course,
            as: 'teachingCourses',
            through: {
              where: {
                TeacherTypeId: {
                  [Op.ne]: 1
                }
              }
            },
            where: {id: course.id}
          }
        ],
        where: {
          RoleId: 1,
          [Op.or]: [
            {id: {[Op.in]: Sequelize.literal('(SELECT DISTINCT "userId" FROM "Slots")')}},
            {id: {[Op.in]: Sequelize.literal('(SELECT DISTINCT "mentorId" FROM "Lessons")')}}
          ]
        }
      });
      const rows = [
        ['Усього вчителів', 'Які змінили пароль', 'Активні вчителі'],
        [registeredTeachersCount, changedPasswordTeachersCount, activeTeachersCount]
      ];
      const sheetName = course.name;
      try {
        await createSheetIfNotExists(sheets, spreadsheetId, sheetName);
        await clearSheet(sheets, spreadsheetId, sheetName);
        await uploadDataToGoogleSheet(sheets, spreadsheetId, sheetName, rows);
      } catch (error) {
        res.status(500).json({message: 'Квота за хвилину достигнута'});
      }

      return {
        courseId: course.id,
        courseName: course.name,
        registeredTeachersCount,
        changedPasswordTeachersCount,
        activeTeachersCount
      };
    })
  );

  res.json({message: 'Успішно оновили данні'});
});

exports.UsersThatDontChangedPassword = catchAsync(async (req, res, next) => {
  const changedPasswordTeachers = await User.findAll({
    where: {
      RoleId: 1,
      [Op.and]: [
        Sequelize.where(
          Sequelize.fn('AGE', Sequelize.col('User.updatedAt'), Sequelize.col('User.createdAt')),
          {[Op.lt]: '00:01:00'}
        )
      ]
    }
  });
  const sheets = await loginToSheet();
  const spreadsheetId = '1x3GGXGr63lBk0LJzu5NGzUGQYjR9phVqoPoy5BN00Fk';

  const rows = [['Name', 'Email']];
  changedPasswordTeachers.forEach(user => rows.push([user?.name, user?.email]));

  const sheetName = 'Users';
  await createSheetIfNotExists(sheets, spreadsheetId, sheetName);
  await clearSheet(sheets, spreadsheetId, sheetName);
  await uploadDataToGoogleSheet(sheets, spreadsheetId, sheetName, rows);
  res.json({message: 'yes', rows: changedPasswordTeachers.length});
});

exports.addMentorToAdminTeam = catchAsync(async (req, res, next) => {
  const {adminId, mentorId} = req.body;
  if (!adminId || !mentorId) return res.status(400).json({message: 'Not enough info'});

  await User.addMentor(adminId, mentorId);

  const mentor = await User.findByPk(mentorId);
  return res.json(mentor);
});

exports.removeMentorFromAdminTeam = catchAsync(async (req, res, next) => {
  const {adminId, mentorId} = req.body;
  if (!adminId || !mentorId) return res.status(400).json({message: 'Not enough info'});
  const data = await User.removeMentor(adminId, mentorId);
  res.json(data);
});
