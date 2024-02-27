const Sequelize = require('sequelize');

const sequelize = require('../db');

const Course = sequelize.define('Course', {
  name: {
    type: Sequelize.STRING(200),
    allowNull: false
  },
  group_amount: {type: Sequelize.INTEGER, defaultValue: 0}
});
const TeacherCourse = sequelize.define('TeacherCourse', {});
module.exports = {Course, TeacherCourse};
