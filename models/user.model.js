const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

const sequelize = require('../db');
const TeamLeadMentor = require('./TeamLeadMentor');
const User = sequelize.define('User', {
  name: {type: Sequelize.STRING(80), allowNull: false},
  expirience: {type: Sequelize.STRING, defaultValue: 0}, // in years
  isPrevSubgroupPlaced: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  telegramChatId: {type: Sequelize.BIGINT},
  photoUrl: {
    type: Sequelize.STRING
    // defaultValue:
    //   'https://res.cloudinary.com/hzxyensd5/image/upload/v1715070791/jgxfj4poa4f8goi2toaq.jpg'
  },
  slack: {type: Sequelize.STRING},
  slackId: {type: Sequelize.STRING},
  telegram: {type: Sequelize.STRING},
  description: {
    type: Sequelize.STRING
  },
  rating: {
    type: Sequelize.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  email: {
    type: Sequelize.STRING,
    // validate: {isEmail: true},
    unique: true,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  phone: {
    type: Sequelize.STRING,
    // allowNull: false,
    default: '+380123456789'
  },
  city: {
    type: Sequelize.STRING,
    // allowNull: false,
    default: 'Kharkiv'
  }
});

const hashPassword = async password => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

User.beforeSave(async user => {
  if (user.changed('password')) {
    user.password = await hashPassword(user.password);
  }
});

User.prototype.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Method to remove a mentor for a specific administrator
User.removeMentor = async function (adminId, mentorId) {
  try {
    await TeamLeadMentor.destroy({
      where: {
        adminId,
        mentorId
      }
    });
    return {status: 'success', message: 'Mentor removed successfully.'};
  } catch (error) {
    console.error('Error removing mentor:', error);
    throw new Error('Error removing mentor.');
  }
};
User.addMentor = async function (adminId, mentorId) {
  try {
    await TeamLeadMentor.create({
      adminId,
      mentorId
    });
    return {status: 'success', message: 'Mentor added successfully.'};
  } catch (error) {
    console.error('Error adding mentor:', error);
    throw new Error('Error adding mentor.');
  }
};
module.exports = User;
