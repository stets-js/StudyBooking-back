const express = require('express');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cors = require('cors');

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
const createBasicTeacherTypes = require('./utils/createBasicTeacherTypes');
const teacherTypeRoutes = require('./routes/teacher-type.route');
const subgroupMentorRoutes = require('./routes/subgroup-mentor.route');
const lessonRoutes = require('./routes/lesson.route.js');

const newSubgroups = require('./subgroupScrapper.js');
const newUsers = require('./excel.js');
const mentorScrapper = require('./mentorScrapper.js');
const findEmails = require('./utils/findEmails.js');

require('./utils/telegramBot.js');
const app = express();

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

app.all('*', (req, res, next) => {
  next(`Can't find ${req.originalUrl} on this server :#`, 404);
});

// createBasicRoles();
// createBasicTeacherTypes();
// newSubgroups();
// newUsers();
// mentorScrapper()
// findEmails();

module.exports = app;
