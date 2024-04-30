const {kafka} = require('./client');

async function init() {
  const admin = kafka.admin();
  console.log('Admin connecting...');
  admin.connect();
  console.log('Admin Connection Success...');

  console.log('Creating Topic [Test-top]');
  await admin.createTopics({
    topics: [
      {
        topic: 'Test-top',
        numPartitions: 2
      }
    ]
  });
  console.log('Topic Created Success [Test-top]');

  console.log('Disconnecting Admin..');
  await admin.disconnect();
}

init();
