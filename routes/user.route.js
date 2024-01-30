const express = require('express');

const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.use(authController.protect, authController.allowedTo('administrator'));

router.route('/').get(userController.getAllUsers).post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUserById)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

router.route('/:id/courses').get(userController.getUserCourses);

router
  .route('/:id/courses/:course_id')
  .post(userController.addUserCourse)
  .delete(userController.deleteUserCourse);

module.exports = router;
