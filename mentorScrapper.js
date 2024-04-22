const fs = require('fs');
const csv = require('csv-parser');
const {SubGroup, User} = require('./models/relation.js');
const {performance} = require('perf_hooks');
const bcrypt = require('bcrypt');
const {Op} = require('sequelize');
const inputFilePath = 'lms_mentor.csv';
const results = [];
const mentorScrapper = async () => {
  const startTime = performance.now();
  console.log('started subgroup Creating');
  fs.createReadStream(inputFilePath)
    .pipe(csv({}))
    .on('data', async data => {
      if (data.activated !== 'FALSE') {
        results.push(data);
      }
    })
    .on('end', async () => {
      results.forEach(async data => {
        try {
          //   console.log(data);
          const user = await User.findOne({
            where: {
              [Op.or]: [{name: data.last_name + ' ' + data.first_name}, {email: data.username}]
            }
          });
          if (user) {
            user.phone = data.phone;
            user.city = JSON.parse(data.metadata).city;
            user.email = data.username;
            await user.save();
          } else {
            await User.create({
              email: data.username,
              name: data.last_name + ' ' + data.first_name,
              password: await bcrypt.hash('password', 12),
              RoleId: 1,
              phone: data.phone,
              city: JSON.parse(data.metadata).city
            });
          }
        } catch (e) {
          console.log(e);
        }
      });
      const endTime = performance.now();
      const elapsedTime = endTime - startTime;
      console.error('Ended');
      console.log(`Время выполнения: ${elapsedTime} миллисекунд`);
    });
};

module.exports = mentorScrapper;
