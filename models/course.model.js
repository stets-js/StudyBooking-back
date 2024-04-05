const Sequelize = require('sequelize');

const sequelize = require('../db');
const User = require('./user.model');

const Course = sequelize.define('Course', {
  name: {
    type: Sequelize.STRING(200),
    allowNull: false
  },
  group_amount: {type: Sequelize.INTEGER, defaultValue: 0}
});
const TeacherCourse = sequelize.define('TeacherCourse', {
  userId: {
    type: Sequelize.DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  courseId: {
    type: Sequelize.DataTypes.INTEGER,
    references: {
      model: Course,
      key: 'id'
    }
  },
  
});
module.exports = {Course, TeacherCourse};
