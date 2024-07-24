const {DocumentType} = require('../models/document-type.model');
const sendTelegramNotification = require('../utils/sendTelegramNotification');
const factory = require('./factory.controller');

exports.getAllDocumentTypes = factory.getAll(DocumentType);

exports.getDocumentTypeById = factory.getOne(DocumentType);

exports.createDocumentType = factory.createOne(DocumentType);

exports.deleteDocumentType = factory.deleteOne(DocumentType);

exports.updateDocumentType = factory.updateOne(DocumentType);
