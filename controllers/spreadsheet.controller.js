const {
  User,
  Course,
  SubGroup,
  SubgroupMentor,
  Slot,
  Lesson,
  TeacherCourse,
  Role
} = require('../models/relation');
const {google} = require('googleapis');
const catchAsync = require('../utils/catchAsync');
const {Op, Sequelize} = require('sequelize');
const sequelize = require('../db');
const {format} = require('date-fns');
const getActivityStats = require('../utils/spreadsheet/DataFormating/getActivityStats');
const getActivityStatsByCourse = require('../utils/spreadsheet/DataFormating/getActivityStatsByCourse');
const createSheetIfNotExists = require('../utils/spreadsheet/createSheetIfNotExists');
const clearSheet = require('../utils/spreadsheet/clearSheet');
const uploadDataToGoogleSheet = require('../utils/spreadsheet/uploadData');
const Report = require('../models/report.model');
const {Survey, Question, Answer} = require('../models/survey.model');
const {sendMessage} = require('../rabbitMQ/producer');
const sendEmail = require('../utils/email');

const spreadsheetId = process.env.SPREADSHEET_ID;
let sheetId = 3; // !!!
const loginToSheet = () => {
  // Create a new instance of GoogleAuth
  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: 'service_account',
      private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.CLIENT_EMAIL
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  return google.sheets({version: 'v4', auth});
};

const mergeCells = async (sheets, mergeRanges, columnStart, columnEnd) => {
  await Promise.all(
    mergeRanges.map(async mergeRange => {
      if (mergeRange.end - mergeRange.start > 1) {
        for (let columnIndex = columnStart; columnIndex <= columnEnd; columnIndex++) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: {
              requests: [
                {
                  mergeCells: {
                    range: {
                      sheetId,
                      startRowIndex: mergeRange.start - 1,
                      endRowIndex: mergeRange.end - 1,
                      startColumnIndex: columnIndex,
                      endColumnIndex: columnIndex + 1
                    },
                    mergeType: 'MERGE_ALL'
                  }
                }
              ]
            }
          });
        }
      }
    })
  );
};

const sheets = loginToSheet();
sheets.spreadsheets
  .get({
    spreadsheetId
  })
  .then(response => {
    const sheets = response.data.sheets;
    const sheetInfo = sheets.find(sheet => sheet.properties.title === 'Sheet3');
    sheetId = sheetInfo.properties.sheetId;
    console.log('ID листа:', sheetId);
  })
  .catch(err => {
    console.error('Ошибка:', err);
  });
exports.updateSheet = async (req, res, next) => {
  try {
    const users = await User.findAll({
      where: {'$Role.name$': 'teacher'},
      include: [
        {
          model: Course,
          as: 'teachingCourses'
        },
        {
          model: SubGroup,
          as: 'mentorSubgroups'
        }
      ]
    });

    const rows = [
      [
        'Mentor',
        'Email',
        'Course count',
        'Subgroup count',
        'Course',
        'Subgroup',
        'Type',
        'Schedule'
      ]
    ];
    let mergeRanges = [];
    let mergeSubgroupsRanges = [];
    let cursor = {start: 2, end: 2}; // 1 is header
    let subgroupCursor = {start: 2, end: 2};
    users.forEach(user => {
      cursor.start = cursor.end;
      subgroupCursor.start = cursor.start;
      subgroupCursor.end = cursor.end;
      let rowValues = [];
      let coursesLen = user.teachingCourses.length;
      let subGroupLen = user.mentorSubgroups.length;
      rowValues[0] = user.name;
      rowValues[1] = user.email;
      rowValues[2] = coursesLen;
      rowValues[3] = subGroupLen;
      user.teachingCourses.forEach(course => {
        subgroupCursor.start = subgroupCursor.end; // every new course must be new group of subgroups

        rowValues[4] = course.name;
        const subgroups = user.mentorSubgroups.filter(el => el.CourseId === course.id);

        if (subgroups.length > 0) {
          subgroups.forEach(group => {
            rowValues[5] = group.name;
            rowValues[6] = 'type';
            rowValues[7] = group?.SubgroupMentor.schedule;
            rows.push([...rowValues]);
            cursor.end += 1;
            subgroupCursor.end += 1;
          });
          mergeSubgroupsRanges.push({start: subgroupCursor.start, end: subgroupCursor.end});
        } else {
          for (let i = 5; i <= 7; i++) rowValues[i] = null;
          rows.push([...rowValues]);
          cursor.end += 1;
        }
      });
      mergeRanges.push({start: cursor.start, end: cursor.end});
    });

    const resource = {
      spreadsheetId,
      range: 'Sheet3',
      valueInputOption: 'RAW',
      resource: {values: rows}
    };
    await sheets.spreadsheets.values.update(resource);
    mergeCells(sheets, mergeRanges, 0, 3);
    mergeCells(sheets, mergeSubgroupsRanges, 4, 4);

    // Return the URL of the created spreadsheet
    res.json({
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      // users,
      message: 'updated spreadsheet'
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.resize = async (req, res, next) => {
  try {
    // Autosize cells
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 8 // Adjust this based on the number of columns
              }
            }
          }
        ]
      }
    });

    // Return the URL of the created spreadsheet
    res.json({
      message: 'resized!'
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.addBorders = async (req, res, next) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Sheet3`
    });

    const values = response.data.values;

    if (values && values.length > 0) {
      const lastRow = values.length;

      const border = {
        style: 'SOLID',
        width: 1,
        color: {
          red: 0,
          green: 0,
          blue: 0,
          alpha: 1
        }
      };

      // Apply border to the entire range of cells
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              updateBorders: {
                range: {
                  sheetId,
                  startRowIndex: 0,
                  endRowIndex: lastRow,
                  startColumnIndex: 0,
                  endColumnIndex: 8
                },
                top: border,
                bottom: border,
                left: border,
                right: border,
                innerHorizontal: border,
                innerVertical: border
              }
            }
          ]
        }
      });
    }

    // Return the URL of the created spreadsheet
    res.json({
      message: 'added borders!'
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};

exports.getActivityStats = catchAsync(async (req, res, next) => {
  // this endpoint for filling sheet with slots/lessons/subgroup per month
  const {start, end} = req.query;
  const sheets = await loginToSheet();
  const spreadsheetId = '1oLtCH6ZTyg6Q0ZNQaukxHciJRHRh-wjINAf7R6ctTAk';
  const results = await getActivityStats(start, end);
  const sheetName = 'All';
  const rows = [
    [
      'Виставлені групові слоти',
      'Виставлені індивідуальні слоти',
      'Проведені групи',
      'Призначені групи',
      'Проведені індиви',
      'Призначені індиви',
      'Проведені kids групи',
      'Призначені kids групи'
    ],
    [
      results.openHoursGroupLen,
      results.openHoursIndivLen,
      results.groupCount,
      results.groupAppointed,
      results.individualCount,
      results.indivAppointed,
      results.groupKidsCount,
      results.groupKidsAppointed
    ]
  ];
  try {
    await clearSheet(sheets, spreadsheetId, sheetName);
    await uploadDataToGoogleSheet(sheets, spreadsheetId, sheetName, rows);
  } catch (error) {
    return res.status(500).json({message: 'Квота за хвилину достигнута'});
  }

  res.json(results);
});

exports.getActivityStatsByCourse = catchAsync(async (req, res, next) => {
  // this endpoint for filling sheet with slots/lessons/subgroup per month
  const {start, end} = req.query;
  const courseId = req.query.courseId;

  let where = {};
  if (courseId) where.id = courseId;

  const sheets = await loginToSheet();
  const spreadsheetId = '1oLtCH6ZTyg6Q0ZNQaukxHciJRHRh-wjINAf7R6ctTAk';

  const results = await getActivityStatsByCourse(start, end, where);
  results.forEach(async sheet => {
    const sheetName = sheet.courseName;
    const rows = [
      [
        'Виставлені групові слоти',
        'Виставлені індив слоти',
        'Проведені групи',
        'Призначені групи',
        'Проведені індиви',
        'Призначені індиви',
        'Проведені kids групи',
        'Призначені kids групи'
      ],
      [
        sheet.groupCount,
        sheet.individualCount,
        sheet.groupAppointed,
        sheet.individualCount,
        sheet.groupKidsAppointed,
        sheet.groupCount,
        sheet.groupKidsCount,
        sheet.individualCount
      ]
    ];
    console.log(sheet);
    try {
      await createSheetIfNotExists(sheets, spreadsheetId, sheetName);
      await clearSheet(sheets, spreadsheetId, sheetName);
      await uploadDataToGoogleSheet(sheets, spreadsheetId, sheetName, rows);
    } catch (error) {
      return res.status(500).json({message: 'Квота за хвилину достигнута'});
    }
  });
  res.json(results);
});
exports.getSurveyAnswers = catchAsync(async (req, res, next) => {
  const spreadsheetId = '1yXL-m63lfL6R3DSrOY73YkwdcJFB1bnKYvYkTDnN0VU';
  const survey = await Survey.findOne({
    where: {id: req.params.id},
    include: [
      {
        model: Question
      }
    ]
  });
  const questions = survey.Questions;
  questions.sort((a, b) => a.id - b.id);

  const users = await User.findAll({
    attributes: ['name', 'RoleId'],
    include: [
      {
        model: Answer,
        attributes: ['response'],
        required: true,
        include: [
          {
            model: Question,
            order: [['id', 'ASC']],
            include: {
              model: Survey,
              attributes: ['title']
            }
          }
        ]
      },
      {
        model: Role,
        attributes: ['name']
      }
    ]
  });
  const sheetsData = [
    {title: survey.title, rows: [['Піб', 'Роль', ...questions.map(el => el.text)]]}
  ];
  // return res.json(users);
  let statistics = [];
  questions.forEach(question =>
    statistics.push(
      [question.text, ...question.answers],
      ['total', ...question.answers.map(el => '')]
    )
  );
  if (req.query.updateStatistcs)
    sheetsData.push({title: survey.title + ' statistics', rows: statistics});
  for (const user of users) {
    const row = [user.name, user.Role.name, ...user.Answers.map(el => el.response)];
    sheetsData[0].rows.push(row);
  }

  const sheets = await loginToSheet();

  // Загружаем данные на Google Sheets
  sheetsData.forEach(async el => {
    try {
      await createSheetIfNotExists(sheets, spreadsheetId, el.title);
      await clearSheet(sheets, spreadsheetId, el.title);
      await uploadDataToGoogleSheet(sheets, spreadsheetId, el.title, el.rows);
    } catch (error) {
      console.error(`Помилка завантаження даних на аркуш ${survey.title}: ${error.message}`);
      throw error;
    }
  });

  res.json({survey, users});
});

exports.getAllSheets = catchAsync(async (req, res, next) => {
  const sheets = loginToSheet();
  const spreadsheetId = req.params.id;
  const sheetsData = await sheets.spreadsheets.get({
    spreadsheetId
  });

  res.status(200).json({
    status: 'success',
    data: {
      sheets: sheetsData.data.sheets.map(el => el.properties.title)
    }
  });
});
const normalizeTextToUkrainian = text => {
  return text
    .replace(/a/g, 'а') // латинська "a" на кириличну "а"
    .replace(/e/g, 'е') // латинська "e" на кириличну "е"
    .replace(/o/g, 'о') // латинська "o" на кириличну "о"
    .replace(/i/g, 'і') // латинська "i" на кириличну "і"
    .replace(/y/g, 'у') // латинська "y" на кириличну "у"
    .replace(/c/g, 'с') // латинська "c" на кириличну "с"
    .replace(/p/g, 'р') // латинська "p" на кириличну "р"
    .replace(/x/g, 'х') // латинська "x" на кириличну "х"
    .replace(/m/g, 'м') // латинська "m" на кириличну "м"
    .replace(/k/g, 'к') // латинська "k" на кириличну "к"
    .replace(/H/g, 'Н'); // латинська "H" на кириличну "Н"
};
const generatePossibleNames = name => {
  // here is magic, possible names
  // first name - FN, last name -LN, middle name - MN
  // FN LN, LN FN, FN (MN) LS - what i need
  const arr = [name, normalizeTextToUkrainian(name)];
  const splitted = name.split(' ');
  if (splitted.length > 2) {
    // case when FN LN MN -> FN (MN) LN
    if (!splitted[1].startsWith('('))
      arr.push(`${splitted[0]} (${splitted[2]}) ${splitted[1]}`, `${splitted[0]} ${splitted[1]}`);
  } else {
    arr.push(`${splitted[1]} ${splitted[0]}`);
  }
  if (name.includes("'") || name.includes('`') || name.includes('‘') || name.includes('’'))
    arr.push(
      name.replace("'", '`'),
      name.replace('`', "'"),
      name.replace('‘', "'"),
      name.replace('’', "'")
    );
  return arr;
};

exports.fetchReportsFromSheets = catchAsync(async (req, res, next) => {
  const sheets = loginToSheet();
  const spreadsheetId = req.params.id;
  const sheetLabel = req.params.sheetId;
  const fullResponse = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId,
    ranges: [sheetLabel],
    fields: 'sheets(data(rowData(values(userEnteredValue,formattedValue,hyperlink))))'
  });
  const rowData = fullResponse.data.sheets[0].data[0].rowData.splice(5);
  const headers = fullResponse.data.sheets[0].data[0].rowData.splice(0, 5);
  let totalIndex = 0;
  headers.forEach(header => {
    if (Array.isArray(header.values))
      header.values.forEach((headerCell, index) => {
        if (headerCell.formattedValue === 'Загальний бал') {
          totalIndex = index;
        }
      });
  });
  req.totalIndex = totalIndex;
  const formattedRows = rowData.map(row =>
    row.values
      ? row.values.map(cell => {
          if (cell.hyperlink) {
            return cell.hyperlink;
          } else {
            return cell.formattedValue;
          }
        })
      : []
  );
  // );
  req.headers = headers;
  req.rows = formattedRows;

  next();
  // res.status(200).json({formattedRows, headers});
});

exports.AddReportsToDB = catchAsync(async (req, res, next) => {
  const sheetName = req.params.sheetId;
  const {headers, rows} = req;
  const totalIndex = req.totalIndex;
  console.log(headers);
  let notFound = [];
  const courses = await Course.findAll();

  const reports = await Promise.all(
    rows.map(async row => {
      const name = row[0];
      const nameVariants = generatePossibleNames(name);
      const user = await User.findOne({
        where: {
          name: nameVariants
        }
      });

      if (!user) {
        notFound.push(name);
        return undefined;
      } else {
        const course = courses.find(
          c => c.name.trim().toLowerCase() === row[1].trim().toLowerCase()
        );
        const body = {
          mentorId: user.id,
          total: row[totalIndex],
          sheetName
        };

        if (course) body.courseId = course.id;
        else body.course = row[1];

        body.link = row[2];
        try {
          const newRep = await Report.create(body);
          if (user.slackId) {
            sendMessage('slack_queue', 'slack_direct', {
              text: 'Вам був висланий звіт від *Відділу контролі якості*',
              blocks: [
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `Переглянути [букінг](https://study-booking.netlify.app/report/)\n
                     Перегляньте ваш [звіт](${newRep.link}).`
                  }
                }
              ]
            });
          }
          await sendEmail({
            email: user.email,
            subject: 'Звіт від Відділу контролі якості ',
            message: 'Вам був висланий звіт від "Відділу контролі якості"',
            html: `<div styles="font-family:"Poppins", sans-serif; font-size:20px;>
            <h3>Вам був висланий звіт від "Відділу контролі якості"!<h3>
            <a href="https://study-booking.netlify.app/report" target="_blank" rel="noreferrer">
            Booking
            </a> <br/>
            <a href=${newRep.link} target="_blank" rel="noreferrer">
            Звіт
            </a>
            </div>`
          });
          return await newRep.reload();
        } catch (error) {
          return undefined;
        }
      }
    })
  );
  res.json({notFound, reports, headers});
});
