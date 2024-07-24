const {Sequelize, Op} = require('sequelize');
const {Slot} = require('../../../models/slot.model');
const {Lesson} = require('../../../models/lesson.model');
const {Course} = require('../../../models/course.model');
const {SubGroup} = require('../../../models/subgroup.model');

const getActivityStatsByCourse = async (start, end, where) => {
  const courses = await Course.findAll({where});
  console.log(courses, 'COURSES!');
  const results = await Promise.all(
    courses.map(async (course, index) => {
      // Количество открытых часов
      const openHours = await Slot.count({
        where: {
          startDate: {
            [Op.between]: [start, end]
          },
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

      // Количество индивидуальных занятий
      const individualCount = await Lesson.count({
        where: {date: {[Op.between]: [start, end]}, appointmentTypeId: 8},
        include: {model: SubGroup, where: {CourseId: course.id}},
        group: ['subgroupId']
      });

      return {
        courseId: course.id,
        courseName: course.name,
        openHoursLen: openHours,
        groupCount: groupCount.length,
        individualCount: individualCount.length
      };
    })
  );
  return results;
};
module.exports = getActivityStatsByCourse;
