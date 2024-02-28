const {Replacement} = require('../models/relation');
const factory = require('./factory.controller');

exports.getAllReplacements = factory.getAll(Replacement);

exports.getReplacementById = factory.getOne(Replacement);

exports.createReplacement = factory.createOne(Replacement);

exports.deleteReplacement = factory.deleteOne(Replacement);

exports.updateReplacement = factory.updateOne(Replacement);
