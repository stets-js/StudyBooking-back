const {UserDocument} = require('../models/relation');
const factory = require('./factory.controller');

exports.getAllUserDocuments = factory.getAll(UserDocument);

exports.getUserDocumentById = factory.getOne(UserDocument);

exports.createUserDocument = factory.createOne(UserDocument);

exports.deleteUserDocument = factory.deleteOne(UserDocument);

exports.updateUserDocument = factory.updateOne(UserDocument);
