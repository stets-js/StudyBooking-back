const express = require('express');

const authController = require('../controllers/auth.controller');
const courseController = require('../controllers/course.controller');

const router = express.Router();

router.route('/').get(courseController.getAllCourses);
router.route('/:id').get(courseController.getCourseById);

router.use(authController.protect, authController.allowedTo('administrator', 'superAdmin'));

router.post('/', courseController.createCourse);
router.route('/:id').delete(courseController.deleteCourse).patch(courseController.updateCourse);

router.get('/:id/users', courseController.getTeachersForCourse);

module.exports = router;
