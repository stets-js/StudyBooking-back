const express = require('express');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const app = express();

//development loging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 10,
  windowMs: 60 * 1000,
  message: 'Too many requests from this IP, please try again later'
});

// Body parser
app.use(express.json({limit: '10kb'}));

// Limit requests from same IP
app.use('/api', limiter);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// routes
app.use('/api/lifecheck', (req, res, next) => {
  res.json({message: 'I am alive!'});
});

app.all('*', (req, res, next) => {
  next(`Can't find ${req.originalUrl} on this server :#`, 404);
});

module.exports = app;
