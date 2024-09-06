const {DataTypes} = require('sequelize');
const sequelize = require('../db');
const User = require('./user.model');
const {Course} = require('./course.model');
const {SubGroup} = require('./subgroup.model');

const Report = sequelize.define(
  'Reports',
  {
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
    course: {type: DataTypes.STRING},
    date: {
      type: DataTypes.DATEONLY,
      defaultValue: new Date()
    },
    mark1: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },
    mark2: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },
    crit_error: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },

    total: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },
    rating: {
      type: DataTypes.STRING(1)
    },
    report_rating: {type: DataTypes.STRING(1)},
    link: {type: DataTypes.STRING},
    sheetName: {
      type: DataTypes.STRING
    },

    status: {
      type: DataTypes.ENUM('Погоджено', 'Погодження', 'Апеляція'),
      defaultValue: 'Погодження'
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['mentorId', 'sheetName']
      }
    ]
  }
);

module.exports = Report;
