const ExcelJS = require('exceljs');
const {User, Role, Course, SubGroup} = require('../models/relation');

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
    // Створюємо новий документ Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Teachers');

    // Додаємо дані до електронної таблиці
    let cursorForNames = 2; // 1 is header, and than  we start from 2
    const font = {size: 14, family: 2}; // 2 -times new roman
    sheet.addRow([
      'Mentor',
      'Email',
      'Course count',
      'Subgroup count',
      'Course',
      'Subgroup',
      'Type',
      'Schedule'
    ]);
    // return res.json(users);
    users.forEach((user, index) => {
      let subGroupLen = user.MentorSubGroups.length;
      let coursesLen = user.teachingCourses.length;
      let rowValues = [];
      rowValues[0] = user.name;
      rowValues[1] = user.email;
      rowValues[2] = coursesLen;
      rowValues[3] = subGroupLen;
      let courseCursor = cursorForNames;
      user.teachingCourses.forEach(course => {
        rowValues[4] = course.name;
        const subgroups = user.MentorSubGroups.filter(el => el.CourseId === course.id);

        if (subgroups.length > 0) {
          subgroups.forEach(group => {
            rowValues[5] = group.name;
            rowValues[6] = 'type';
            rowValues[7] = group.schedule;
            sheet.addRow(rowValues);
          });
          sheet.mergeCells(`E${courseCursor}:E${courseCursor + subgroups.length - 1}`);
          courseCursor += subgroups.length;
        } else {
          sheet.addRow(rowValues);
          courseCursor += 1;
        }
      });

      if (cursorForNames < courseCursor - 1) {
        sheet.mergeCells(`A${cursorForNames}:A${courseCursor - 1}`);
        sheet.mergeCells(`B${cursorForNames}:B${courseCursor - 1}`);
        sheet.mergeCells(`C${cursorForNames}:C${courseCursor - 1}`);
        sheet.mergeCells(`D${cursorForNames}:D${courseCursor - 1}`);
      }

      cursorForNames = courseCursor;
    });
    sheet.columns.forEach(function (column, i) {
      let maxLength = 0;
      column.eachCell({includeEmpty: true}, function (cell) {
        var columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength + 10;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength;
      column.font = font;
    });
    // Генеруємо електронну таблицю у форматі Excel
    const buffer = await workbook.xlsx.writeBuffer();

    // Відправляємо створену електронну таблицю як відповідь на запит
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="example.xlsx"');
    res.send(buffer);

    // res.json(users);
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    res.status(500).send('Internal Server Error');
  }
};
