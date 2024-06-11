const TelegramBot = require('node-telegram-bot-api');

const {verifyUser} = require('../controllers/auth.controller');
const {User} = require('../models/relation');
// Your Telegram bot token
const token = '7361130041:AAGIIqcTmUh-KigWFkJ3lM97C2ByFeN7SjI';

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, msg => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привіт! Введіть свою почту з букінга.');
  bot.once('message', msg => processEmail(msg));
});

function processEmail(msg) {
  const chatId = msg.chat.id;
  email = msg.text;
  bot.sendMessage(chatId, 'Тепер введіть пароль.');
  bot.once('message', msg => processPassword(msg, email));
}

async function processPassword(msg, email) {
  const chatId = msg.chat.id;
  const password = msg.text;
  const user = await verifyUser(email, password);
  if (!user) {
    // error
    bot.sendMessage(chatId, 'Щось не так, перевірте свої данні');
  } else {
    processAddChatId(chatId, user);
  }
}

async function processAddChatId(chatId, user) {
  bot.sendMessage(chatId, 'Починаю інтеграцію!');

  const res = await User.update({telegramChatId: chatId}, {where: {email: user.email}});
  if (res) {
    bot.sendMessage(chatId, 'Інтеграція пройшла успішно!');
  } else {
    bot.sendMessage(chatId, 'Щось не так, сповістіть команду розробників :(');
    console.error(response.data);
  }
}

module.export = bot;
