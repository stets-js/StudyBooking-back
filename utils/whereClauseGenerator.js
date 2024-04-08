const {Op} = require('sequelize');
const catchAsync = require('./catchAsync');

module.exports = catchAsync(async (req, res, next) => {
  const clause = {};
  // for available subGroup part
  if (req.query.type) clause['SubGroupId'] = {[Op.ne]: null};
  if (req.query.weekDay) clause['weekDay'] = req.query.weekDay;
  if (req.query.endSubGroup) clause['endDate'] = {[Op.gte]: new Date(req.query.endSubGroup)};

  if (req.query.mentorId) clause['mentorId'] = req.query.mentorId;
  if (req.query.softMentorId) clause['softMentorId'] = req.query.softMentorId;
  if (req.query.techMentorId) clause['techMentorId'] = req.query.techMentorId;

  if (req.query.name) clause['name'] = {[Op.iLike]: `%${req.query.name}%`};
  if (req.query.CourseId) clause['CourseId'] = req.query.CourseId;
  if (req.query.role) clause['$Role.name$'] = req.query.role;
  if (req.query.userId) clause[userId] = req.query.role;
  if (req.query.users) clause['$User.id$'] = {[Op.in]: JSON.parse(req.query.users)};
  if (req.body.userIds) {
    clause.userId = {[Op.in]: req.body.userIds};
    clause['$AppointmentType.name$'] = 'universal';
  }
  if (req.params.id) clause.userId = req.params.id; // cause of Slot userId seact
  if (req.query.startDate) {
    clause.startDate = {
      [Op.lte]: new Date(req.query.endDate)
    };

    clause.endDate = {
      [Op.or]: [
        {[Op.eq]: null},
        // req.query.endDate
        //   ? {
        {[Op.gte]: new Date(req.query.startDate)}
        //     }
        //   : {}
      ]
    };
  }
  if (req.query.teachersFilter && req.query.courses) {
    // I am sorry, but i killed more than 3 hours trying to get users -> teachersCourses <- courses
    // association, so its corner case with pure SQL
    // Filtering by courses for teachers

    const courseIdList = req.query.courses ? JSON.parse(req.query.courses) : [];
    const userNameLike = req.query.name ? `%${req.query.name}%` : null;

    const result = await sequelize.query(
      `
        SELECT "Users"."id", "Users"."name", "Users"."rating","Users"."email"
        FROM "Users"
        JOIN "TeacherCourses" ON "Users"."id" = "TeacherCourses"."userId"
        JOIN "Courses" ON "TeacherCourses"."courseId" = "Courses"."id"
        WHERE "Users"."RoleId" = 1
          ${
            courseIdList.length > 0
              ? 'AND ARRAY(SELECT "courseId" FROM "TeacherCourses" WHERE "userId" = "Users"."id") @> ARRAY[:courseIds]'
              : ''
          }
          ${userNameLike ? 'AND "Users"."name" iLIKE :userName' : ''}
        GROUP BY "Users"."id"
        ORDER BY "Users"."rating" DESC
        `,
      {
        replacements: {
          courseIds: courseIdList,
          courseCount: courseIdList.length,
          userName: userNameLike
        },
        type: sequelize.QueryTypes.SELECT
      }
    );
    return res.status(200).json({
      message: 'success',
      data: result
    });
  }
  req.whereClause = clause;
  next();
});
