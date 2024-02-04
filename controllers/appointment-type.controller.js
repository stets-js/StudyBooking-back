const {Appointment_Type} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory.controller');

exports.getAllAppointmentTypes = factory.getAll(Appointment_Type);

exports.getAppointmentTypeById = factory.getOne(Appointment_Type);

exports.createAppointmentType = factory.createOne(Appointment_Type);

exports.deleteAppointmentType = factory.deleteOne(Appointment_Type);

exports.updateAppointmentType = factory.updateOne(Appointment_Type);
