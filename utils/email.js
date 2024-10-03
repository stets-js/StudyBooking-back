const {sendMessage} = require('../rabbitMQ/producer');

const sendEmail = async options => {
  await sendMessage('email', {...options, sender: 'Teaching booking'});
};

module.exports = sendEmail;
