const {
  User,
  Course,
  SubGroup,
  SubgroupMentor,
  Slot,
  Lesson,
  TeacherCourse
} = require('../models/relation');
const {google} = require('googleapis');
const catchAsync = require('../utils/catchAsync');
const {Op, Sequelize} = require('sequelize');
const sequelize = require('../db');
const getActivityStats = require('../utils/spreadsheet/DataFormating/getActivityStats');
const getActivityStatsByCourse = require('../utils/spreadsheet/DataFormating/getActivityStatsByCourse');
const createSheetIfNotExists = require('../utils/spreadsheet/createSheetIfNotExists');
const clearSheet = require('../utils/spreadsheet/clearSheet');
const uploadDataToGoogleSheet = require('../utils/spreadsheet/uploadData');

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
    res.status(400).json(error);
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
    ['Откриті слоти', 'Призначені групи', 'Призначені індиви'],
    [results.openHoursLen, results.groupCount, results.individualCount]
  ];
  try {
    await clearSheet(sheets, spreadsheetId, sheetName);
    await uploadDataToGoogleSheet(sheets, spreadsheetId, sheetName, rows);
  } catch (error) {
    res.status(500).json({message: 'Квота за хвилину достигнута'});
  }

  res.json(results);
});

exports.getActivityStatsByCourse = catchAsync(async (req, res, next) => {
  // this endpoint for filling sheet with slots/lessons/subgroup per month
  const {start, end} = req.query;
  const results = await getActivityStatsByCourse(start, end);
  results.forEach(async sheet => {
    const sheetName = sheet.courseName;
    const rows = [
      ['Откриті слоти', 'Призначені групи', 'Призначені індиви'],
      [sheet.openHoursLen, sheet.groupCount, sheet.individualCount]
    ];
    try {
      await createSheetIfNotExists(sheets, spreadsheetId, sheetName);
      await clearSheet(sheets, spreadsheetId, sheetName);
      await uploadDataToGoogleSheet(sheets, spreadsheetId, sheetName, rows);
    } catch (error) {
      res.status(500).json({message: 'Квота за хвилину достигнута'});
    }
  });
  res.json(results);
});
