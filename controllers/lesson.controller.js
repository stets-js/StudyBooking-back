const {Op} = require('sequelize');
const {addMinutes, format} = require('date-fns');

const {
  Slot,
  Lesson,
  LessonSchedule,
  LessonTopic,
  SubGroup,
  Course,
  SubgroupMentor,
  User,
  Replacement,
  Appointment_Type,
  Feedback
} = require('../models/relation');

const catchAsync = require('../utils/catchAsync');
const factory = require('./factory.controller');
const getCorrectDay = require('../utils/getCorrectDay');

exports.getAllLessons = catchAsync(async (req, res, next) => {
  let document;
  let whereClause = req.whereClause;
  let subgroupWhereClause = {};
  if (req.query.courseId) {
    subgroupWhereClause = {
      CourseId: +req.query.courseId
    };
  }
  try {
    document = await Lesson.findAll({
      where: whereClause,
      include: [
        LessonSchedule,
        User,
        LessonTopic,
        Feedback,
        {
          model: Replacement,
          include: [
            {
              model: SubGroup,
              where: subgroupWhereClause,
              include: [Course, SubgroupMentor, {model: User, as: 'Admin', attributes: ['name']}]
            }
          ]
        },
        Appointment_Type,
        {
          model: SubGroup,
          // required: false,
          where: subgroupWhereClause,
          include: [Course, SubgroupMentor, {model: User, as: 'Admin', attributes: ['name']}]
        }
      ],
      offset: req.query.offset,
      limit: req.query.limit,
      order: [
        ['date', 'ASC'],
        [Lesson.associations.LessonSchedule, 'startTime', 'ASC']
      ]
    });
  } catch (e) {
    console.log(e);
  }
  totalCount = await Lesson.count({
    where: whereClause
  });

  return res.json({
    status: 'success',
    results: document.length,
    data: document,
    totalCount,
    subgroupWhereClause,
    newOffset: +req.query.offset + +req.query.limit
  });
});

exports.bulkUpdate = catchAsync(async (req, res, next) => {
  if (!req.body.appointmentTypeId) {
    return res.status(400).json({message: 'error not enough info'});
  }
  // const universalId = await Appointment_Type.findOne({where: {name: 'universal'}});

  let bodyForUpdate = {
    appointmentTypeId: req.body.appointmentTypeId,
    startDate: req.body.startDate,
    endDate: req.body.endDate
  };
  if (req.body.ReplacementId) bodyForUpdate.ReplacementId = req.body.ReplacementId;
  else bodyForUpdate.subgroupId = req.body.subgroupId;
  const docs = await Slot.update(bodyForUpdate, {
    where: {
      weekDay: req.body.weekDay,
      time: {[Op.in]: req.body.time},
      userId: req.body.userId
    }
  });
  req.docs = docs;
  next();
});

exports.bulkCreate = catchAsync(async (req, res, next) => {
  let lessons = [];
  const start = new Date(req.body.startDate);
  const end = new Date(req.body.endDate);
  let currentDate = start;
  const endTime = format(
    addMinutes(new Date(`1970 ${req.body.time[req.body.time.length - 1]}`), 30),
    'HH:mm'
  );
  let [schedule, created] = await LessonSchedule.findOrCreate({
    where: {
      weekDay: req.body.weekDay,
      startTime: req.body.time[0],
      endTime: endTime
    },
    defaults: {
      weekDay: req.body.weekDay,
      startTime: req.body.time[0],
      endTime: endTime
    }
  });
  while (currentDate <= end) {
    if (getCorrectDay(currentDate.getDay()) === req.body.weekDay) {
      lessons.push({
        mentorId: req.body.userId || req.body.mentorId,
        date: format(currentDate, 'yyyy-MM-dd'),
        LessonScheduleId: schedule.id,
        appointmentTypeId: req.body.appointmentTypeId,
        subgroupId: req.body.subgroupId,
        ReplacementId: req.body.ReplacementId
      });
      currentDate.setDate(currentDate.getDate() + 7);
    } else currentDate.setDate(currentDate.getDate() + 1); // Переходим к следующей дате
  }
  const docs = await Lesson.bulkCreate(lessons);
  res.json({docs, schedule, start, end});
});

exports.updateLesson = factory.updateOne(Lesson);

exports.getAllTopics = factory.getAll(LessonTopic);

exports.deleteLesson = factory.deleteOne(Lesson);

exports.deleteLessons = catchAsync(async (req, res, next) => {
  const docs = Lesson.destroy({where: req.body});
  res.status(204).json(docs);
});
