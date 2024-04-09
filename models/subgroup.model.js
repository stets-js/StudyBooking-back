const Sequelize = require('sequelize');

const sequelize = require('../db');
const User = require('./user.model');
const {TeacherType} = require('./teacher-type.model');

const SubGroup = sequelize.define('SubGroup', {
  link: {
    type: Sequelize.STRING
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  startDate: {
    type: Sequelize.DATE,
    default: new Date()
    // allowNull: false
  },
  endDate: {
    type: Sequelize.DATE,
    default: new Date()
    // allowNull: false
  },
  // schedule: {
  //   type: Sequelize.TEXT
  //   // allowNull: false
  // },
  description: {
    type: Sequelize.STRING
  }
});

const SubgroupMentor = sequelize.define('SubgroupMentor', {
  schedule: {
    type: Sequelize.TEXT
    // allowNull: false
  },
  mentorId: {
    type: Sequelize.DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  subgroupId: {
    type: Sequelize.DataTypes.INTEGER,
    references: {
      model: SubGroup,
      key: 'id'
    }
  },
  TeacherTypeId: {
    type: Sequelize.DataTypes.INTEGER,
    references: {
      model: TeacherType,
      key: 'id'
    }
  }
});

module.exports = {SubGroup, SubgroupMentor};
