const {format} = require('date-fns');

const generateBlockConfirmation = (
  subgroupName,
  courseName,
  startDate,
  endDate,
  schedule,
  adminId
) => {
  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Вам призначено новий потік:',
        emoji: true
      }
    },
    {
      type: 'section',

      fields: [
        {
          type: 'mrkdwn',
          text: `Назва:\n*${subgroupName}*`
        },

        {
          type: 'mrkdwn',
          text: `Курс:\n*${courseName}*`
        },
        {
          type: 'mrkdwn',
          text: `Призначив:\n*<@${adminId}>*`
        }
      ]
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Дата початку:*\n${format(startDate, 'dd.MM.yyyy')}`
        },
        {
          type: 'mrkdwn',
          text: `*Кінцева дата:*\n${format(endDate, 'dd.MM.yyyy')}`
        },

        {
          type: 'mrkdwn',
          text: `*Графік:*\n ${schedule.replaceAll(',', '\n')}`
        }
      ]
    }
  ];
};
module.exports = {generateBlockConfirmation};
