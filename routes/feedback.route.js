const express = require('express');

const authController = require('../controllers/auth.controller');
const whereClauseGenerator = require('../utils/whereClauseGenerator');
const lessonController = require('../controllers/lesson.controller');
const feedbackController = require('../controllers/feedback.controller');

const router = express.Router();

router.use(authController.protect);

router.route('/').post(feedbackController.createFeedback);

router.use(authController.allowedTo(['administrator', 'superAdmin']));

module.exports = router;
