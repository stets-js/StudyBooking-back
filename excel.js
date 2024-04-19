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
const ids = {
  'ADVANCED PROGRAM': 108,
  ART: 109,
  INTERNAL: 110,
  MARATHON: 111,
  MINI_COURSE: 112,
  DEMO: 113,
  SCHOOL_FOR_TEACHERS: 114,
  SCHOOL: 115,
  Design: 116,
  DIGITAL_DESIGN: 117,
  DESIGN_JUNIOR: 118,
  FRONTEND: 119,
  'FrontEnd Eng': 120,
  FRONTEND_JUNIOR: 121,
  GAMEDEV: 122,
  'Graphic design': 123,
  Logic: 124,
  MATH: 125,
  'Math 1': 126,
  'Math 2': 127,
  'Math 3': 128,
  'Math 4': 129,
  'Math 5': 130,
  'Math 6': 131,
  'Math Teens (7-9)': 132,
  MINECRAFT: 133,
  'Minecraft Ed': 134,
  MINECRAFT_KIDS: 135,
  'Motion design': 136,
  PYTHON: 137,
  PYTHON_JUNIOR: 138,
  Roblox: 139,
  'Roblox kids': 140,
  SCRATCH: 141,
  DRAWING: 142,
  'Web design': 143
};
const newUsers = async () => {
  const startTime = performance.now();
  console.log('STARTED READING EXCEL');
  // Load the Excel file
  const workbook = xlsx.readFile('backup.xlsx');
  let teacherCount = 0;
  // Get the names of all sheets
  const sheetNames = workbook.SheetNames;

  // Define a function to scrape data from a sheet
  async function scrapeSheet(sheetName) {
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
      try {
        if (rowData.email) {
          const doc = await User.create({
            email: rowData.email,
            name: rowData.name,
            password: await bcrypt.hash('password', 12),
            RoleId: 1
          });
          for (const key in rowData) {
            if (rowData[key] === true && key !== 'name' && key !== 'email') {
              const id = ids[key];
              if (id) {
                const res = await TeacherCourse.create({
                  userId: doc.id,
                  courseId: id,
                  TeacherTypeId: 2
                });
              }
            }
          }
        }
      } catch (e) {
        console.log(e);
        console.log(rowData);
      }
    }

    return data;
  }

  // Display scraped data
  await scrapeSheet(sheetNames[0]);
  const endTime = performance.now();
  const elapsedTime = endTime - startTime;
  console.log('Ended');
  console.log(`Время выполнения: ${elapsedTime} миллисекунд`);
};

module.exports = newUsers;
