const {SubGroup} = require('../models/subgroup.model');
const {kafka} = require('./client');

async function consumeSubgroups() {
  const consumer = kafka.consumer({groupId: 'test'});
  await consumer.connect();

  await consumer.subscribe({topics: ['AddSubgroups'], fromBeginning: true});

  await consumer.run({
    eachMessage: async ({topic, partition, message, heartbeat, pause, commitOffsets}) => {
      console.log(`1: [${topic}]: PART:${partition}:`, message.value.toString());

      try {
        const subgroupData = JSON.parse(message.value.toString());
        await SubGroup.create(subgroupData);

        await commitOffsets([{topic, partition, offset: message.offset}]);

        console.log('Success.');
      } catch (error) {
        console.error('Ошибка при создании SubGroup:', error);
      }
    }
  });
}

consumeSubgroups();
