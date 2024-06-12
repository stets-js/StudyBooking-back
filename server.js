const path = require('path');

require('dotenv').config({path: path.resolve(__dirname, './config.env')});

// const createTopics = require('./kafka/createTopic');
// const consumer = require('./kafka/consumer');
// const {sendMessage} = require('./kafka/producer');
const slackApp = require('./utils/slackBot');

process.on('uncaughtException', err => {
  console.log('unchaughtException!! Shutting down server...');
  console.log(err.name, err.message);
  // process.exit(1);
});

const app = require('./app');

// sendMessage({value: 'Hello world', key: 'test'});
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  slackApp
    .start()
    .then(() => {
      console.log('Slack app started!');
    })
    .catch(err => {
      console.error('Error starting Slack app:', err);
    });
  console.log(`App running on port ${port}`);
});
