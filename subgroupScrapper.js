const fs = require('fs');
const csv = require('csv-parser');
const {SubGroup} = require('./models/relation.js');
const {performance} = require('perf_hooks');
const ids = {
  // 'ADVANCED PROGRAM': 108,
  // ART: 109,
  // INTERNAL: 110,
  // MARATHON: 111,
  // MINI_COURSE: 112,
  // DEMO: 113,
  // SCHOOL_FOR_TEACHERS: 114,
  // SCHOOL: 115,
  // Design: 116,
  // DIGITAL_DESIGN: 117,
  // DESIGN_JUNIOR: 118,
  // FRONTEND: 119,
  // 'FrontEnd Eng': 120,
  // FRONTEND_JUNIOR: 121,
  // GAMEDEV: 122,
  // 'Graphic design': 123,
  // Logic: 124,
  // MATH: 125,
  // 'Math 1': 126,
  // 'Math 2': 127,
  // 'Math 3': 128,
  // 'Math 4': 129,
  // 'Math 5': 130,
  // 'Math 6': 131,
  // 'Math Teens (7-9)': 132,
  // MINECRAFT: 133,
  // 'Minecraft Ed': 134,
  // MINECRAFT_KIDS: 135,
  // 'Motion design': 136,
  // PYTHON: 137,
  // PYTHON_JUNIOR: 138,
  ROBLOX: 139
  // 'Roblox kids': 140,
  // SCRATCH: 141,
  // DRAWING: 142,
  // 'Web design': 143
};

const inputFilePath = 'lms_group.csv';

const results = [];

const newSubgroups = async () => {
  const startTime = performance.now();
  console.log('started subgroup Creating');
  fs.createReadStream(inputFilePath)
    .pipe(csv({}))
    .on('data', data => {
      if (data.specialization && data.is_archived !== 'true') {
        if (ids[data.specialization]) {
          results.push({name: data.name, CourseId: ids[data.specialization], id: data.id});
        }
      }
    })
    .on('end', async () => {
      for (const res of results) {
        await SubGroup.create({
          name: res.name,
          CourseId: res.CourseId,
          id: res.id
        });
      }
      const endTime = performance.now();
      const elapsedTime = endTime - startTime;
      console.error('Ended');
      console.log(`Время выполнения: ${elapsedTime} миллисекунд`);
    });
};
// Set(19) {
//   'MINECRAFT', ++
//   'ROBLOX', ++
//   'DESIGN_JUNIOR', ++
//   'MATH', ++
//   'MINI_COURSE',
//   'MINECRAFT_KIDS',
//   'SCRATCH',
//   'DIGITAL_DESIGN',
//   'DRAWING',
//   'PYTHON',
//   'GAMEDEV',
//   'FRONTEND',
//   'FRONTEND_JUNIOR',
//   'INTERNAL',
//   'MARATHON',
//   'DEMO',
//   'SCHOOL_FOR_TEACHERS',
//   'SCHOOL',
//   'PYTHON_JUNIOR'
// }
module.exports = newSubgroups;
