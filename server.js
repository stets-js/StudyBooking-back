const path = require('path');

require('dotenv').config({path: path.resolve(__dirname, './config.env')});

// const createTopics = require('./kafka/createTopic');
// const consumer = require('./kafka/consumer');
// const {sendMessage} = require('./kafka/producer');

process.on('uncaughtException', err => {
  console.log('unchaughtException!! Shutting down server...');
  console.log(err.name, err.message);
  // process.exit(1);
});

const app = require('./app');
const {generateButtons} = require('./utils/slackBot');
const {sendMessage} = require('./rabbitMQ/producer');

// sendMessage({value: 'Hello world', key: 'test'});
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// C07DM1PERK8

// sendMessage('slack_queue', 'slack_group_confirm_subgroup', {
//   channelId: 'C07DM1PERK8',
//   text: 'Будеш працювати?',
//   userId: 'U07DTKVFV2N'
// });
require('./rabbitMQ/consumer');
