const Logs = require('../models/log.model');

const logger = (tokens, req, res) => {
  // Определяем маршруты, которые хотим игнорировать
  const notIgnoringGets = ['/api/lessons'];
  if (req.method === 'GET' && !notIgnoringGets.includes(tokens.url(req, res).split('?')[0])) {
    return null;
  }
  const status = tokens.status(req, res);
  if (status < 200 || status >= 300) {
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
