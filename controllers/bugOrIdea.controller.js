const BugOrIdea = require('../models/bugOrIdea.model');
const User = require('../models/user.model');
const factory = require('./factory.controller');

exports.getAllBugOrIdeas = factory.getAll(BugOrIdea);

exports.getBugOrIdeaById = factory.getOne(BugOrIdea);

exports.createBugOrIdea = factory.createOne(BugOrIdea);

exports.sendTelegramAfterCreating = async (req, res, next) => {
  console.log('hello');
  const user = await User.findByPk(req.body.userId);

  let message = '';
  if (req.body.type === 'bug')
    message = `
 💥BUG💥
  author: ${user ? user.name : req.body.userName}
  describeIt: ${req.body.title}.
  location: ${req.body.location}.
  Selected location: ${req.body.selectedPath}.
  Links: ${req.body.links}
  `;
  else {
    message = `
  💡Idea💡
  author: ${user ? user.name : req.body.userName}
  describeIt: ${req.body.title}.
  Links: ${req.body.links}.
  Description: ${req.body.description}
    `;
  }
  console.log(message);
  // ''
  sendTelegramNotification('-1002197881869', ``);
  next();
};
exports.deleteBugOrIdea = factory.deleteOne(BugOrIdea);

exports.updateBugOrIdea = factory.updateOne(BugOrIdea);
