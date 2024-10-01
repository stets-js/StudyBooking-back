const {Sequelize, Op, literal} = require('sequelize');
const sequelize = require('../../../db');
const {Slot} = require('../../../models/slot.model');
const {Lesson} = require('../../../models/lesson.model');
const {SubGroup, SubgroupMentor} = require('../../../models/subgroup.model');

const getActivityStats = async (start, end) => {
  const openHoursGroup = await Slot.count({
    where: {
      startDate: {
        [Op.between]: [start, end]
      },
      appointmentTypeId: 1
    }
  });
  const openHoursIndivs = await Slot.count({
    where: {
      startDate: {
        [Op.between]: [start, end]
      },
      appointmentTypeId: 2
    }
  });
  const groupCount = await Lesson.count({
    where: {date: {[Op.between]: [start, end]}, appointmentTypeId: 7},

    group: ['subgroupId']
  });
  const groupKidsCount = await Lesson.count({
    where: {date: {[Op.between]: [start, end]}, appointmentTypeId: 11},

    group: ['subgroupId']
  });
  const groupAppointed = await SubgroupMentor.count({
    include: {
      model: SubGroup,
      where: literal(`EXISTS (
        SELECT 1 
        FROM "Lessons" AS l
        WHERE l."subgroupId" = "SubGroup".id 
        AND l."appointmentTypeId" = 7
      )`)
    },
    where: {
      createdAt: {[Op.between]: [start, end]}
    }
  });
  const groupKidsAppointed = await SubgroupMentor.count({
    include: {
      model: SubGroup,
      where: literal(`EXISTS (
        SELECT 1 
        FROM "Lessons" AS l
        WHERE l."subgroupId" = "SubGroup".id 
        AND l."appointmentTypeId" = 11
      )`)
    },
    where: {
      createdAt: {[Op.between]: [start, end]}
    }
  });
  const indivAppointed = await SubgroupMentor.count({
    include: {
      model: SubGroup,
      where: literal(`EXISTS (
        SELECT 1 
        FROM "Lessons" AS l
        WHERE l."subgroupId" = "SubGroup".id 
        AND l."appointmentTypeId" = 8
      )`)
    },
    where: {
      createdAt: {[Op.between]: [start, end]}
    }
  });
  const individualCount = await Lesson.count({
    where: {date: {[Op.between]: [start, end]}, appointmentTypeId: 8},

    group: ['subgroupId']
  });

  return {
    openHoursGroupLen: openHoursGroup,
    openHoursIndivLen: openHoursIndivs,
    groupCount: groupCount.length,
    individualCount: individualCount.length,
    groupAppointed: groupAppointed,
    indivAppointed: indivAppointed,
    groupKidsCount: groupKidsCount.length,
    groupKidsAppointed
  };
};
module.exports = getActivityStats;
