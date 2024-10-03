const amqp = require('amqplib');

const sendMessage = async (type, body) => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  const queueName = 'message_queue';

  await channel.assertQueue(queueName, {durable: true});

  const message = {
    type: type, // tg ,slack, email
    body
  };

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
  console.log('Message sent to queue');
  await channel.close();
  await connection.close();
};

module.exports = {sendMessage};
