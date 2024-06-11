const {App} = require('@slack/bolt');

// Инициализация приложения с использованием токена и Signing Secret
const app = new App({
  token: 'xoxb-7241956041495-7254097484533-KswBMkJPklq7y5Bh2t1EnE7a',
  signingSecret: '39637d6b9e3a866708e66529adb214b5'
});

// Обработка упоминаний бота в канале
app.event('app_mention', async ({event, say}) => {
  await say(`Привет, <@${event.user}>! Как я могу помочь?`);
});

// Обработка сообщений в канале
app.message(/привет/i, async ({message, say}) => {
  await say(`Привет, <@${message.user}>!`);
});

(async () => {
  await app.start(3001);
  console.log('⚡️ Slack бот запущен на порту 3001');
})();
