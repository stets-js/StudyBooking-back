const Logs = require('../models/log.model');

const logger = (tokens, req, res) => {
  const notIgnoringGets = ['/api/lessons'];
  const ignore = '/api/spreadsheet/'; // for now its only one endpoint,later it can be array
  console.log(tokens.url(req, res), 'URL!!!!!!!!!!!!!');
  if (req.method === 'GET' && !notIgnoringGets.includes(tokens.url(req, res).split('?')[0])) {
    return null;
  } else if (req.method === 'POST' && tokens.url(req, res).startsWith(ignore)) return null;
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
