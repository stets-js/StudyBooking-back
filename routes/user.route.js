const express = require('express');

const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');
const slotController = require('../controllers/slot.controller');
const whereClauseGenerator = require('../utils/whereClauseGenerator');
const router = express.Router();
router.get('/health-check', (req, res, next) => {
  res.json({message: 'Hello, i am ok'});
});

router.use(authController.protect);
router
  .route('/:id/courses/:course_id')
  .post(userController.addUserCourse)
  .delete(userController.deleteUserCourse);
router.get('/:id', userController.getUserById);
router
  .route('/:id/slots')
  .get(whereClauseGenerator, slotController.getAllSlots)
  .post(slotController.createUserSlot);

router.route('/available-teachers/:weekDay/:courseId').get(userController.getFreeUsers);
router
  .route('/:id/slots/:slotId')
  .patch(slotController.updateSlot)
  .delete(slotController.deleteSlot);

router.use(authController.allowedTo(['administrator', 'superAdmin']));

router
  .route('/')
  .get(whereClauseGenerator, userController.getAllUsers)
  .post(userController.createUser, authController.forgotPassword);

router
  .route('/:id')

  .delete(userController.deleteUser)
  .patch(userController.updateUser);

router.route('/:id/courses').get(userController.getUserCourses);

router
  .route('/:subGroupId/mentorsForReplacement')
  .get(userController.getUsersForReplacementSubGroup);
module.exports = router;
