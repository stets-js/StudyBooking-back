const {kafka} = require('./client');

async function init() {
  const consumer = kafka.consumer({groupId: 'test'});
  await consumer.connect();

  await consumer.subscribe({topics: ['Test-top'], fromBeginning: true});

  await consumer.run({
    eachMessage: async ({topic, partition, message, heartbeat, pause}) => {
      console.log(`1: [${topic}]: PART:${partition}:`, message.value.toString());
    }
  });
}

init();
