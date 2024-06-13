const {Feedback} = require('../models/relation');
const factory = require('./factory.controller');

exports.getAllFeedbacks = factory.getAll(Feedback);

exports.getFeedbackById = factory.getOne(Feedback);

exports.createFeedback = factory.createOne(Feedback);

exports.deleteFeedback = factory.deleteOne(Feedback);

exports.updateFeedback = factory.updateOne(Feedback);
