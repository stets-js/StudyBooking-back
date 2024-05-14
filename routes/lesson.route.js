const express = require('express');

const authController = require('../controllers/auth.controller');
const whereClauseGenerator = require('../utils/whereClauseGenerator');
const lessonController = require('../controllers/lesson.controller');

const router = express.Router();

router.use(authController.protect);

router.route('/').get(whereClauseGenerator, lessonController.getAllLessons);
router.route('/topics').get(lessonController.getAllTopics);

router.use(authController.allowedTo(['administrator', 'superAdmin']));

router.route('/bulk').post(whereClauseGenerator, lessonController.bulkCreate);

router.route('/').delete(lessonController.deleteLessons);

router.route('/:id').patch(lessonController.updateLesson);

module.exports = router;
