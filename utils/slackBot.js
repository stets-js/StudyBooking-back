const {App, ExpressReceiver} = require('@slack/bolt');

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET
});
// Инициализация приложения с использованием токена и Signing Secret
const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver
});
(async () => {
  await slackApp.start();
  // Обработка упоминаний бота в канале
  slackApp.event('app_mention', async ({event, say}) => {
    await say(`Привет, <@${event.user}>! Как я могу помочь?`);
  });

  // Обработка сообщений в канале
  slackApp.message('hello', async ({message, say}) => {
    await say(`Привет, <@${message.user}>!`);
  });

  console.log('⚡️ Slack бот запущен на порту 3001');
})();

module.exports = slackApp;
