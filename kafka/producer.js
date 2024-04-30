const {kafka} = require('./client');

async function sendMessage(message) {
  const producer = kafka.producer();

  console.log('Connecting Producer');
  await producer.connect();
  console.log('Producer Connected Successfully');

  await producer.send({
    topic: 'Test-top',
    messages: [message]
  });
  await producer.disconnect();
}

module.exports = {sendMessage};
