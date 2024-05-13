const express = require('express');

const whereClauseGenerator = require('../utils/whereClauseGenerator');
const lessonController = require('../controllers/lesson.controller');
const router = express.Router();

router.route('/').get(whereClauseGenerator, lessonController.getAllLessons);
// router.route('/:id').get(lessonController.getLessonById);
router.route('/bulk').post(whereClauseGenerator, lessonController.bulkCreate);

router.route('/:id').patch(lessonController.updateLesson);
module.exports = router;
