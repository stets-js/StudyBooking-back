const xlsx = require('xlsx');
const {User, TeacherCourse} = require('./models/relation.js');
const {performance} = require('perf_hooks');
const bcrypt = require('bcrypt');
const courseName = [
  'GAMEDEV',
  'Roblox',
  'MINECRAFT',
  'SCRATCH',
  'MATH',
  'DRAWING',
  'DIGITAL_DESIGN',
  'DESIGN_JUNIOR',
  'PYTHON',
  'FRONTEND_JUNIOR',
  'FRONTEND',
  'SoftSkills'
];

const newUsers = async () => {
  const startTime = performance.now();
  console.log('STARTED READING EXCEL');
  // Load the Excel file
  const workbook = xlsx.readFile('backup.xlsx');
  let teacherCount = 0;
  // Get the names of all sheets
  const sheetNames = workbook.SheetNames;

  // Define a function to scrape data from a sheet
  function scrapeSheet(sheetName) {
    const sheet = workbook.Sheets[sheetName];
    const range = xlsx.utils.decode_range(sheet['!ref']);

    // Initialize an array to store scraped data
    const data = [];

    // Iterate through each row in the sheet
    for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
      // Initialize an object to store data for the current row
      const rowData = {};

      // Iterate through each cell in the row
      for (let colNum of [0, 3, ...Array.from({length: 12}, (_, i) => i + 6)]) {
        const cellAddress = xlsx.utils.encode_cell({r: rowNum, c: colNum});
        const cell = sheet[cellAddress];
        const cellValue = (cell && cell.v) || '';

        // Assign keys to the cell values
        if (colNum === 0) {
          rowData['name'] = cellValue;
          if (cellValue) teacherCount++;
        } else if (colNum === 3) {
          rowData['email'] = cellValue;
        } else {
          // Courses
          const courseIndex = colNum - 6;

          rowData[courseName[courseIndex]] = cellValue;
        }
      }

      // Push the rowData object to the data array
      data.push(rowData);
    }

    return data;
  }

  // Example: Scrape data from the first sheet
  const firstSheetName = sheetNames[0];
  const scrapedData = scrapeSheet(firstSheetName);
  console.log(teacherCount);
  // Display scraped data
  console.log('READED!!!');

  console.log('started user transfer');
  scrapedData.forEach(async user => {
    if (user.email) {
      console.log(user.email);
      const doc = await User.create({
        email: user.email,
        name: user.name,
        password: await bcrypt.hash('password', 12),
        RoleId: 1
      });

      for (const key in user) {
        if (obj[key] === true && key !== 'name' && key !== 'email') {
          const id = ids[key];
          if (id) {
            await TeacherCourse.create({
              userId: doc.id,
              courseId: id,
              TeacherTypeId: 2
            });
          }
        }
      }
    }
  });
  const endTime = performance.now();
  const elapsedTime = endTime - startTime;
  console.log('Ended');
  console.log(`Время выполнения: ${elapsedTime} миллисекунд`);
};

module.exports = newUsers;
