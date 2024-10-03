const {sendMessage} = require('../rabbitMQ/producer');

const sendTelegramNotification = async (chatId, text) => {
  console.log('trying to send message');
  return sendMessage('tg_queue', 'tg', {chatId, text});
};
module.exports = sendTelegramNotification;
