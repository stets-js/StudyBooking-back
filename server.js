const dotenv = require('dotenv');

dotenv.config({path: './config.env'});

process.on('uncaughtException', err => {
  console.log('unchaughtException!! Shutting down server...');
  console.log(err.name, err.message);
  // process.exit(1);
});

const app = require('./app');

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
