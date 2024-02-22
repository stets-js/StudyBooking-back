const Sequelize = require('sequelize');

const sequelize = require('../db');

const Slot = sequelize.define('Slot', {
  weekDay: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  time: {
    type: Sequelize.STRING(10)
  },
  startDate: {
    type: Sequelize.DATEONLY
  },
  endDate: {
    type: Sequelize.DATEONLY,
    defaultValue: null
  }
});

const Appointment_Type = sequelize.define('AppointmentType', {
  name: {
    type: Sequelize.STRING(100)
  }
});

module.exports = {Slot, Appointment_Type};
