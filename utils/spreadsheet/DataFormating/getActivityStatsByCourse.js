const {Sequelize, Op, literal} = require('sequelize');
const {Slot} = require('../../../models/slot.model');
const {Lesson} = require('../../../models/lesson.model');
const {Course} = require('../../../models/course.model');
const {SubGroup, SubgroupMentor} = require('../../../models/subgroup.model');

const getActivityStatsByCourse = async (start, end, where) => {
  const courses = await Course.findAll({where});
  const results = await Promise.all(
    courses.map(async (course, index) => {
      // Количество открытых часов
      const openHoursGroup = await Slot.count({
        where: {
          startDate: {
            [Op.between]: [start, end]
          },
          appointmentTypeId: 1,
          [Op.and]: Sequelize.literal(`
            EXISTS (
              SELECT 1 
              FROM "TeacherCourses" AS "teachingCourses"
              WHERE "teachingCourses"."userId" = "Slot"."userId" 
                AND "teachingCourses"."courseId" = ${course.id}
            )
          `)
        }
      });
      const openHoursIndiv = await Slot.count({
        where: {
          startDate: {
            [Op.between]: [start, end]
          },
          appointmentTypeId: 2,
          [Op.and]: Sequelize.literal(`
            EXISTS (
              SELECT 1 
              FROM "TeacherCourses" AS "teachingCourses"
              WHERE "teachingCourses"."userId" = "Slot"."userId" 
                AND "teachingCourses"."courseId" = ${course.id}
            )
          `)
        }
      });
      // Количество групп через SubgroupMentor
      const groupCount = await Lesson.count({
        where: {date: {[Op.between]: [start, end]}, appointmentTypeId: 7},
        include: {model: SubGroup, where: {CourseId: course.id}},
        group: ['subgroupId']
      });
      const groupKidsCount = await Lesson.count({
        where: {date: {[Op.between]: [start, end]}, appointmentTypeId: 11},
        include: {model: SubGroup, where: {CourseId: course.id}},
        group: ['subgroupId']
      });

      const individualCount = await Lesson.count({
        where: {date: {[Op.between]: [start, end]}, appointmentTypeId: 8},
        include: {model: SubGroup, where: {CourseId: course.id}},
        group: ['subgroupId']
      });
      const groupKidsAppointed = await SubgroupMentor.count({
        include: {
          model: SubGroup,
          where: {
            CourseId: course.id,
            [Op.and]: literal(`EXISTS (
              SELECT 1 
              FROM "Lessons" AS l
              WHERE l."subgroupId" = "SubGroup".id 
              AND l."appointmentTypeId" = 11
            )`)
          }
        },
        where: {
          createdAt: {[Op.between]: [start, end]}
        }
      });
      const groupAppointed = await SubgroupMentor.count({
        include: {
          model: SubGroup,
          where: {
            CourseId: course.id,
            [Op.and]: literal(`EXISTS (
              SELECT 1 
              FROM "Lessons" AS l
              WHERE l."subgroupId" = "SubGroup".id 
              AND l."appointmentTypeId" = 7
            )`)
          }
        },
        where: {
          createdAt: {[Op.between]: [start, end]}
        }
      });
      const indivAppointed = await SubgroupMentor.count({
        include: {
          model: SubGroup,
          where: {
            CourseId: course.id,
            [Op.and]: literal(`EXISTS (
              SELECT 1 
              FROM "Lessons" AS l
              WHERE l."subgroupId" = "SubGroup".id 
              AND l."appointmentTypeId" = 8
            )`)
          }
        },
        where: {
          createdAt: {[Op.between]: [start, end]}
        }
      });
      return {
        courseId: course.id,
        courseName: course.name,
        groupCount: groupCount.length,
        individualCount: individualCount.length,
        groupAppointed,
        indivAppointed,
        groupKidsAppointed,
        groupKidsCount: groupKidsCount.length,
        openHoursGroup,
        openHoursIndiv
      };
    })
  );
  return results;
};
module.exports = getActivityStatsByCourse;
