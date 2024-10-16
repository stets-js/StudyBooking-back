const Sequelize = require('sequelize');

const sequelize = require('../db');

const Lesson = sequelize.define('Lesson', {
  date: {type: Sequelize.DATEONLY},
  status: {
    type: Sequelize.DataTypes.ENUM('replaced', 'canceled', 'completed', 'idle'),
    defaultValue: 'idle'
  }
});

const LessonTopic = sequelize.define('LessonTopic', {
  topic: {type: Sequelize.STRING}
});

const LessonSchedule = sequelize.define('LessonSchedule', {
  weekDay: {type: Sequelize.INTEGER, allowNull: false},
  startTime: {type: Sequelize.STRING(8), allowNull: false},
  endTime: {type: Sequelize.STRING(8), allowNull: false}
});
module.exports = {Lesson, LessonTopic, LessonSchedule};
