const express = require('express');

const authController = require('../controllers/auth.controller');
const courseController = require('../controllers/course.controller');

const router = express.Router();

router.route('/').get(courseController.getAllCourses);
router.route('/:id').get(courseController.getCourseById);

router.use(authController.protect, authController.allowedTo('administrator'));

router.post('/', courseController.createCourse);

module.exports = router;
