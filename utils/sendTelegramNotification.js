const bot = require('./telegramBot');

const sendTelegramNotification = async (chatId, body) => {
  console.log('trying to send message');

  message = `Вітаю!\nВам був призначений потік ${body.subgroupName}!\nКурс: ${
    body.selectedCourseName
  }\nВаш графік: \n${body.schedule.replaceAll(',', '\n')}`;
  return await bot.sendMessage(chatId, message);
};
module.exports = sendTelegramNotification;
