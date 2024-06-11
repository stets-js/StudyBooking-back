const slackApp = require('./sendSlackNotification');

const getUserIdByName = async userName => {
  try {
    const result = await slackApp.client.users.list({
      token: process.env.SLACK_BOT_TOKEN
    });

    const user = result.members.find(member => member.name === userName);
    return user ? user.id : null;
  } catch (error) {
    console.error('Ошибка получения списка пользователей:', error);
    return null;
  }
};

exports.sendDirectMessage = async (userName, text) => {
  const userId = await getUserIdByName(userName);
  if (!userId) return;

  try {
    // Открытие или получение ID приватного канала (DM)
    const result = await slackApp.client.conversations.open({
      token: process.env.SLACK_BOT_TOKEN,
      users: userId
    });

    const channelId = result.channel.id;

    // Отправка сообщения в приватный канал
    await slackApp.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channelId,
      text: text
    });

    console.log(`Сообщение отправлено пользователю ${userName}`);
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
  }
};
