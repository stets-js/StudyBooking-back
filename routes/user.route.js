const express = require('express');

const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');
const slotController = require('../controllers/slot.controller');
const router = express.Router();

router.use(authController.protect);
router
  .route('/:id/courses/:course_id')
  .post(userController.addUserCourse)
  .delete(userController.deleteUserCourse);

router.route('/:id/slots').get(slotController.getAllSlots).post(slotController.createUserSlot);

router.route('/available-teachers/:weekDay/:courseId').get(userController.getFreeUsers);
router
  .route('/:id/slots/:slotId')
  .patch(slotController.updateSlot)
  .delete(slotController.deleteSlot);

router.use(authController.allowedTo(['administrator', 'superAdmin']));

router.route('/').get(userController.getAllUsers).post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUserById)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

router.route('/:id/courses').get(userController.getUserCourses);

router
  .route('/:subGroupId/mentorsForReplacement')
  .get(userController.getUsersForReplacementSubGroup);
module.exports = router;
