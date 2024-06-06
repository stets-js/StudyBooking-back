const TelegramBot = require('node-telegram-bot-api');
const botToken = process.env.TELEGRAM_BOT;

const sendTelegramNotification = async (chatId, body) => {
  console.log('trying to send message');
  const bot = new TelegramBot(botToken);

  message = `Вітаю!\nВам був призначений потік ${body.subgroupName}!\nКурс: ${
    body.selectedCourseName
  }\nВаш графік: \n${body.schedule.replaceAll(',', '\n')}`;
  return await bot.sendMessage(chatId, message);
};
module.exports = sendTelegramNotification;
