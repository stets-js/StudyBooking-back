const Logs = require('../models/log.model');

const logger = (tokens, req, res) => {
  const notIgnoringGets = ['/api/lessons'];
  const ignore = '/api/spreadsheet/'; // for now its only one endpoint,later it can be array
  console.log(tokens.url(req, res), 'URL!!!!!!!!!!!!!');

  if (req.method === 'GET' && !notIgnoringGets.includes(tokens.url(req, res).split('?')[0])) {
    return null;
  } else if (req.method === 'POST' && tokens.url(req, res).startsWith(ignore)) return null;
  let body = req.body;
  console.log(req.headers.authorization);
  body.token =
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer') &&
    req.headers.authorization.split(' ')[1];
  body.user = {
    role: req.user.Role.name,
    roleId: req.user.RoleId,
    id: req.user.id,
    email: req.user.email
  };

  const status = tokens.status(req, res);
  if (status < 200 || status >= 300) {
    return null;
  }
  console.log({
    userId: req?.user?.id || null,
    path: tokens.url(req, res),
    body,
    method: tokens.method(req, res)
  });
  Logs.create({
    userId: req?.user?.id || null,
    path: tokens.url(req, res),
    body,
    method: tokens.method(req, res)
  }).catch(error => {
    console.log('Error saving log to database:', error);
  });
};
module.exports = logger;
