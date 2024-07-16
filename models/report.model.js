const {DataTypes} = require('sequelize');
const sequelize = require('../db');
const User = require('./user.model');
const {Course} = require('./course.model');
const {SubGroup} = require('./subgroup.model');

const Report = sequelize.define('Reports', {
  mentorId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  courseId: {
    type: DataTypes.INTEGER,
    references: {
      model: Course,
      key: 'id'
    }
  },
  subgroupId: {
    type: DataTypes.INTEGER,
    references: {
      model: SubGroup,
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: new Date()
  },
  mark: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  link: {type: DataTypes.STRING},
  status: {
    type: DataTypes.ENUM('Погоджено', 'Погодження', 'Апеляція'),
    defaultValue: 'Погодження'
  }
});

module.exports = Report;
