const express = require('express');

const authController = require('../controllers/auth.controller');
const courseController = require('../controllers/course.controller');
const whereClauseGenerator = require('../utils/whereClauseGenerator');

const router = express.Router();

router.route('/').get(whereClauseGenerator, courseController.getAllCourses);
router.route('/:id').get(courseController.getCourseById);
router.get('/:id/users', courseController.getTeachersForCourse);

router.use(authController.protect, authController.allowedTo(['administrator', 'superAdmin']));

router.post('/', courseController.createCourse);
router.route('/:id').delete(courseController.deleteCourse).patch(courseController.updateCourse);

module.exports = router;
