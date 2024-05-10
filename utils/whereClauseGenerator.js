const {Op} = require('sequelize');
const catchAsync = require('./catchAsync');
const {format} = require('date-fns');
module.exports = catchAsync(async (req, res, next) => {
  const clause = {};
  // for available subGroup part
  // for one day subgroup table
  if (req.query.type) clause['subgroupId'] = {[Op.ne]: null};
  if (req.query.weekDay) clause['weekDay'] = req.query.weekDay;
  if (req.query.endSubGroup) clause['endDate'] = {[Op.gte]: new Date(req.query.endSubGroup)};
  if (req.query.startSubGroup) clause['startDate'] = {[Op.lte]: new Date(req.query.startSubGroup)};

  if (req.query.mentorId) clause['mentorId'] = req.query.mentorId;

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
      [Op.lte]: req.query.endDate
    };

    clause.endDate = {
      [Op.or]: [{[Op.eq]: null}, {[Op.gte]: req.query.startDate}]
    };
  }
  if (req.query.startDateLesson) {
    console.log(req.query.endDate);
    clause.date = {
      [Op.and]: [{[Op.gte]: req.query.startDateLesson}, {[Op.lte]: req.query.endDateLesson}]
    };
  }

  req.whereClause = clause;
  next();
});
