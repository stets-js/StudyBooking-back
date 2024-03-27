const {User, Role, Course, SubGroup} = require('../models/relation');
const {google} = require('googleapis');

exports.createSheet = async (req, res, next) => {
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
          as: 'MentorSubGroups',
          include: {model: Course, attributes: ['id', 'name']}
        }
      ]
    });

    // Create a new instance of GoogleAuth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.CLIENT_EMAIL
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ]
    });
    const sheets = google.sheets({version: 'v4', auth});
    const drive = google.drive({version: 'v3', auth});

    // Create a new spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      resource: {
        properties: {
          title: 'Teachers Spreadsheet'
        }
      }
    });
    const spreadsheetId = spreadsheet.data.spreadsheetId;

    // Define data to be written to the spreadsheet
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
      let subGroupLen = user.MentorSubGroups.length;
      let coursesLen = user.teachingCourses.length;
      rowValues[0] = user.name;
      rowValues[0] = user.name;
      rowValues[1] = user.email;
      rowValues[2] = coursesLen;
      rowValues[3] = subGroupLen;
      user.teachingCourses.forEach(course => {
        subgroupCursor.start = subgroupCursor.end; // every new course must be new group of subgroups

        rowValues[4] = course.name;
        const subgroups = user.MentorSubGroups.filter(el => el.CourseId === course.id);

        if (subgroups.length > 0) {
          subgroups.forEach(group => {
            rowValues[5] = group.name;
            rowValues[6] = 'type';
            rowValues[7] = group.schedule;
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

    // Write data to the spreadsheet
    const resource = {
      spreadsheetId,
      range: 'Sheet1',
      valueInputOption: 'RAW',
      resource: {values: rows}
    };
    await sheets.spreadsheets.values.update(resource);

    await Promise.all(
      mergeRanges.map(async mergeRange => {
        if (mergeRange.end - mergeRange.start > 1) {
          for (let columnIndex = 0; columnIndex <= 3; columnIndex++) {
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId,
              resource: {
                requests: [
                  {
                    mergeCells: {
                      range: {
                        sheetId: 0,
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
    await Promise.all(
      mergeSubgroupsRanges.map(async mergeRange => {
        if (mergeRange.end - mergeRange.start > 1) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: {
              requests: [
                {
                  mergeCells: {
                    range: {
                      sheetId: 0,
                      startRowIndex: mergeRange.start - 1,
                      endRowIndex: mergeRange.end - 1,
                      startColumnIndex: 4,
                      endColumnIndex: 5
                    },
                    mergeType: 'MERGE_ALL'
                  }
                }
              ]
            }
          });
        }
      })
    );
    // Autosize cells
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 8 // Adjust this based on the number of columns
              }
            }
          }
        ]
      }
    });
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
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: rows.length,
                startColumnIndex: 0,
                endColumnIndex: rows[0].length
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
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: {
        role: 'writer',
        type: 'anyone'
      }
    });
    // Return the URL of the created spreadsheet
    res.json({
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
    });
  } catch (error) {
    res.status(400).json(error);
  }
};
