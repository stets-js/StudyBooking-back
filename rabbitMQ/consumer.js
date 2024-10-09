const amqp = require('amqplib');
const {SubgroupMentor} = require('../models/subgroup.model');
const {Lesson} = require('../models/lesson.model');

const processConfirmationOfSubgroup = async body => {
  const {subgroupId, adminId, userId} = body;

  try {
    await SubgroupMentor.update({status: 'approved'}, {where: {subgroupId, mentorId: userId}});
    sendMessage('slack_queue', 'slack_direct', {
      // channelId: 'C07DM1PERK8',
      text: `Користувач <@${userId}> прийняв потік ${subgroupId}`,
      userId: adminId
    });
    console.log(`Subgroup mentor ${subgroupId} confirmed.`);
  } catch (error) {
    console.error('Error confirming subgroup mentor:', error);
  }
};

const processDeclinetionOfSubgroup = async body => {
  const {subgroupId, userId, adminId, reason} = body;

  try {
    await SubgroupMentor.destroy({
      where: {subgroupId, mentorId: userId}
    });
    await Lesson.destroy({
      where: {subgroupId, mentorId: userId}
    });
    console.log(`Subgroup mentor ${subgroupId} declined.`);
    sendMessage('slack_queue', 'slack_direct', {
      // channelId: 'C07DM1PERK8',
      text: `Користувач <@${userId}> відмінив потік ${subgroupId} за причиною: ${reason}`,
      userId: adminId
    });
  } catch (error) {
    console.error('Error declining subgroup mentor:', error);
  }
};

const consumeMessages = async queueName => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, {durable: true});
    console.log(`Waiting for messages in queue: ${queueName}`);

    channel.consume(queueName, async msg => {
      if (msg !== null) {
        const messageContent = JSON.parse(msg.content.toString());
        console.log('Received message:', messageContent);

        await handleMessage(messageContent, channel, msg);
      }
    });
  } catch (error) {
    console.error('Error in RabbitMQ consumer:', error);
  }
};

const handleMessage = async (messageContent, channel, msg) => {
  const {type, body} = messageContent;

  if (type === 'subgroup_confirmed') {
    channel.ack(msg);
    await processConfirmationOfSubgroup(body);
  } else if (type === 'subgroup_declined') {
    channel.ack(msg);
    await processDeclinetionOfSubgroup(body);
  } else {
    console.log('Unknown message type:', type);
  }
};

consumeMessages('slack_queue_confirmation');
