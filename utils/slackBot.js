const path = require('path');

require('dotenv').config({path: path.resolve(__dirname, '../config.env')});

const {App} = require('@slack/bolt');
// Инициализация приложения с использованием токена и Signing Secret

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});
// Обработка упоминаний бота в канале
slackApp.event('app_mention', async ({event, say}) => {
  await say(`Привет, <@${event.user}>! Как я могу помочь?`);
});

// Обработка сообщений в канале
slackApp.message('hello', async ({message, say}) => {
  await say(`Привет, <@${message.user}>!`);
});

module.exports = slackApp;
