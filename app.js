const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

const express = require('express');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cors = require('cors');
const {createEventAdapter} = require('@slack/events-api');
const logger = require('./utils/logger');
const Logs = require('./models/log.model.js');
const createBasicRoles = require('./utils/createBasicRoles');

const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const roleRoutes = require('./routes/role.route');
const courseRoutes = require('./routes/course.route');
const slotsRoutes = require('./routes/slot.route');
const appointmentTypeRoutes = require('./routes/appointment-type.route');
const subGroupRoutes = require('./routes/subgroup.route');
const replacementRoutes = require('./routes/replacement.route');
const spreadsheetRoutes = require('./routes/spreadsheet.route');
const teacherTypeRoutes = require('./routes/teacher-type.route');
const subgroupMentorRoutes = require('./routes/subgroup-mentor.route');
const lessonRoutes = require('./routes/lesson.route');
const feedbackRoutes = require('./routes/feedback.route');
const userDocumentRoutes = require('./routes/user-document.route');
const documentTypeRoutes = require('./routes/document-type.route');
const reportRoutes = require('./routes/report.route');
const bugOrIdeaRoutes = require('./routes/bugOrIdea.route');
const surveyRoutes = require('./routes/survey.route');

const createBasicTeacherTypes = require('./utils/createBasicTeacherTypes');
const newSubgroups = require('./subgroupScrapper.js');
const newUsers = require('./excel.js');
const mentorScrapper = require('./mentorScrapper.js');
const findEmails = require('./utils/findEmails.js');

require('./utils/telegramBot.js');
const slackApp = require('./utils/slackBot.js');
const User = require('./models/user.model.js');

const app = express();
// has to be initialized before all other routes !!!
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
app.use('/slack/events', slackEvents.expressMiddleware());

slackEvents.on('message', async event => {
  if (event.text.includes('hello')) {
    try {
      await slackApp.client.chat.postMessage({
        channel: event.channel,
        text: `Привет, <@${event.user}>!`
      });
    } catch (error) {
      console.error('Error handling message event:', error);
    }
  }
});

//development loging
// if (process.env.NODE_ENV === 'development') {
app.use(morgan('dev'));
// }

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 1000,
  message: 'Too many requests from this IP, please try again later'
});

app.use(cors());

// Body parser
app.use(express.json({limit: '10kb'}));

// Limit requests from same IP
app.use('/api', limiter);

// Serving static files
app.use(express.static(`${__dirname}/public`));

app.use(morgan(logger));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/slots', slotsRoutes);
app.use('/api/appointment-type', appointmentTypeRoutes);
app.use('/api/subgroups', subGroupRoutes);
app.use('/api/replacement', replacementRoutes);
app.use('/api/spreadsheet', spreadsheetRoutes);
app.use('/api/teacher-type', teacherTypeRoutes);
app.use('/api/subgroup-mentor', subgroupMentorRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/user-document', userDocumentRoutes);
app.use('/api/document-type', documentTypeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/bug-or-idea', bugOrIdeaRoutes);
app.use('/api/survey', surveyRoutes);
app.all('*', (req, res, next) => {
  next(`Can't find ${req.originalUrl} on this server :#`, 404);
});

// createBasicRoles();
// createBasicTeacherTypes();
// newSubgroups();
// newUsers();
// mentorScrapper()
// findEmails();

const addMentorsToTL = async (tlId, mentorsEmails) => {
  const admin = await User.findByPk(tlId);
  mentorsEmails.forEach(async mentor => {
    const user = await User.findOne({where: {email: mentor}});
    await admin.addMentor(user);
  });
};

module.exports = app;
