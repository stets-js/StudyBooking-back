const express = require('express');

const authController = require('../controllers/auth.controller');
const whereClauseGenerator = require('../utils/whereClauseGenerator');
const teacherTypeController = require('../controllers/teacher-type.controller')
const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(whereClauseGenerator, teacherTypeController.getAllTeacherTypes)
  .post(teacherTypeController.createTeacherType);

router
  .route('/:id')
  .get(teacherTypeController.getTeacherTypeById)
  .patch(teacherTypeController.updateTeacherType)
  .delete(teacherTypeController.deleteTeacherType);

module.exports = router;
