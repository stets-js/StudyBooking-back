const {kafka} = require('./client');

async function sendMessage({message, topic = 'Test-top'}) {
  const producer = kafka.producer();

  console.log('Connecting Producer');
  await producer.connect();
  console.log('Producer Connected Successfully');

  await producer.send({
    topic,
    messages: [message]
  });
  await producer.disconnect();
}

module.exports = {sendMessage};
