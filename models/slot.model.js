const Sequelize = require('sequelize');

const sequelize = require('../db');

const Slot = sequelize.define('Slot', {
  data: {
    type: Sequelize.DATE,
    allowNull: false
  },
  weekDay: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  time: {
    type: Sequelize.STRING(10)
  }
});

const Appointment_Type = sequelize.define('AppointmentType', {
  name: {
    type: Sequelize.STRING(100)
  }
});

module.exports = {Slot, Appointment_Type};
