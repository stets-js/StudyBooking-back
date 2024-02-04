const express = require('express');

const authController = require('../controllers/auth.controller');
const appointmentTypeController = require('../controllers/appointment-type.controller');
const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(appointmentTypeController.getAllAppointmentTypes)
  .post(appointmentTypeController.createAppointmentType);

router
  .route('/:id')
  .patch(appointmentTypeController.updateAppointmentType)
  .delete(appointmentTypeController.deleteAppointmentType);

module.exports = router;
