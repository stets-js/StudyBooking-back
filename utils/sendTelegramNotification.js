const bot = require('./telegramBot');

const sendTelegramNotification = async (chatId, message) => {
  console.log('trying to send message');

  return await bot.sendMessage(chatId, message);
};
module.exports = sendTelegramNotification;
