const express = require('express');

const authController = require('../controllers/auth.controller');
const appointmentTypeController = require('../controllers/appointment-type.controller');
const whereClauseGenerator = require('../utils/whereClauseGenerator');
const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(whereClauseGenerator, appointmentTypeController.getAllAppointmentTypes)
  .post(appointmentTypeController.createAppointmentType);

router
  .route('/:id')
  .get(appointmentTypeController.getAppointmentTypeById)
  .patch(appointmentTypeController.updateAppointmentType)
  .delete(appointmentTypeController.deleteAppointmentType);

module.exports = router;
