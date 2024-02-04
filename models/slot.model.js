const Sequelize = require('sequelize');

const sequelize = require('../db');

const Slot = sequelize.define('Slot', {
  data: {
    type: Sequelize.DATE
  }
});

const Appointment_Type = sequelize.define('AppointmentType', {
  name: {
    type: Sequelize.STRING(100)
  }
});

module.exports = {Slot, Appointment_Type};
