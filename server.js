const dotenv = require('dotenv');
// const createTopics = require('./kafka/createTopic');
// const consumer = require('./kafka/consumer');
// const {sendMessage} = require('./kafka/producer');
dotenv.config({path: './config.env'});

process.on('uncaughtException', err => {
  console.log('unchaughtException!! Shutting down server...');
  console.log(err.name, err.message);
  // process.exit(1);
});

const app = require('./app');

// sendMessage({value: 'Hello world', key: 'test'});
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
