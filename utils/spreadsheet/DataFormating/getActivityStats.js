const {Sequelize, Op} = require('sequelize');
const sequelize = require('../../../db');
const {Slot} = require('../../../models/slot.model');
const {Lesson} = require('../../../models/lesson.model');
const {SubGroup} = require('../../../models/subgroup.model');

const getActivityStats = async (start, end) => {
  const openHours = await Slot.count({
    where: {
      startDate: {
        [Op.between]: [start, end]
      }
    }
  });
  const groupCount = await Lesson.count({
    where: {date: {[Op.between]: [start, end]}, appointmentTypeId: 7},

    group: ['subgroupId']
  });

  // Количество индивидуальных занятий
  const individualCount = await Lesson.count({
    where: {date: {[Op.between]: [start, end]}, appointmentTypeId: 8},

    group: ['subgroupId']
  });
  return {
    openHoursLen: openHours,
    groupCount: groupCount.length,
    individualCount: individualCount.length
  };
};
module.exports = getActivityStats;
