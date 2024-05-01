const {SubGroup} = require('../models/subgroup.model');
const {kafka} = require('./client');

async function init() {
  const consumer = kafka.consumer({groupId: 'test'});
  await consumer.connect();

  await consumer.subscribe({topics: ['Test-top'], fromBeginning: true});

  await consumer.run({
    eachMessage: async ({topic, partition, message, heartbeat, pause}) => {
      console.log(`1: [${topic}]: PART:${partition}:`, message.value.toString());
      switch (topic) {
        case 'addSubgroup':
          await SubGroup.create(JSON.parse(message.value.toString()));
          break;

        default:
          break;
      }
    }
  });
}

init();
