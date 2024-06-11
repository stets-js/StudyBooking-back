const {App} = require('@slack/bolt');

// Инициализация приложения с использованием токена и Signing Secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

(async () => {
  await app.start(3001);
  // Обработка упоминаний бота в канале
  app.event('app_mention', async ({event, say}) => {
    await say(`Привет, <@${event.user}>! Как я могу помочь?`);
  });

  // Обработка сообщений в канале
  app.message('hello', async ({message, say}) => {
    await say(`Привет, <@${message.user}>!`);
  });

  console.log('⚡️ Slack бот запущен на порту 3001');
})();
