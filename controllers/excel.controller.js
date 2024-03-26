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
    sheet.addRow([
      'Mentors',
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
      rowValues[1] = coursesLen;
      rowValues[2] = subGroupLen;
      const coursesWithSubgroups = user.teachingCourses.reduce((acc, course) => {
        const subgroups = user.MentorSubGroups.filter(subgroup => subgroup.CourseId === course.id);
        acc[course.name] = subgroups.length > 0 ? subgroups : null;
        return acc;
      }, {});
      let startForCourses = cursorForNames; // first row adjusted to name

      for (const [key, value] of Object.entries(coursesWithSubgroups)) {
        if (!value) {
          rowValues[3] = key;
          sheet.addRow(rowValues);
        } else
          value.forEach(group => {
            rowValues[3] = key; // D cell
            rowValues[4] = group.name;
            rowValues[5] = 'type';
            rowValues[6] = group.schedule;
            sheet.addRow(rowValues);
          });
        if (value && value.length > 1) {
          sheet.mergeCells(`D${startForCourses}:D${startForCourses + value.length - 1}`);
        }
        startForCourses += (value || []).length + 1;
      }

      const increment = subGroupLen > coursesLen ? subGroupLen : coursesLen;

      if (increment > 0) {
        const cell = sheet.getCell(`K${cursorForNames}`);
        cell.value = increment;
        sheet.mergeCells(`A${cursorForNames}:A${cursorForNames + increment - 1}`);
        sheet.mergeCells(`B${cursorForNames}:B${cursorForNames + increment - 1}`);
        sheet.mergeCells(`C${cursorForNames}:C${cursorForNames + increment - 1}`);
      }

      cursorForNames += increment;
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
