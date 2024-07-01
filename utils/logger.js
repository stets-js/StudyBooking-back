const Logs = require('../models/log.model');

const logger = (tokens, req, res) => {
  // Определяем маршруты, которые хотим игнорировать
  // const ignoreRoutes = ['/ignore-this-route', '/static'];
  if (req.method === 'GET') {
    return null;
  }
  Logs.create({
    userId: req?.user?.id || null,
    path: tokens.url(req, res),
    body: req.body,
    method: tokens.method(req, res)
  }).catch(error => {
    console.log('Error saving log to database:', error);
  });
};
module.exports = logger;
