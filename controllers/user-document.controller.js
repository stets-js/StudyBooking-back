const sequelize = require('../db');
const {UserDocument} = require('../models/relation');
const factory = require('./factory.controller');
const catchAsync = require('../utils/catchAsync');

exports.getAllUserDocuments = factory.getAll(UserDocument);

exports.getUserDocumentsByUserId = catchAsync(async (req, res, next) => {
  const document = await UserDocument.findAll({
    where: {UserId: req.params.id}
  });
  console.log(document);
  return res.json({
    status: 'success',
    results: document.length,
    data: document
  });
});

exports.addUserDocument = async (req, res, next) => {
  const documentId = req.body.documentId;
  const userId = req.params.id;
  let message = '';
  try {
    // Find the user's document entry in the database
    let userDocument = await UserDocument.findOne({
      where: {UserId: userId, DocumentTypeId: documentId}
    });
    if (!userDocument) {
      // If the user document entry does not exist, create a new one
      userDocument = await UserDocument.create({
        documents: [req.body.document],
        UserId: userId,
        DocumentTypeId: documentId
      });
      message = 'Document added successfully';
    } else {
      // If the user document entry already exists, update it
      userDocument = await UserDocument.update(
        {documents: sequelize.fn('array_append', sequelize.col('documents'), req.body.document)},
        {where: {UserId: userId, DocumentTypeId: documentId}, returning: true}
      );
      message = 'Document appended successfully';
    }
    // Respond with success message or updated user document
    res.status(201).json({message, userDocument});
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).json({error: 'Server error'});
  }
};

exports.createUserDocument = factory.createOne(UserDocument);

exports.deleteUserDocument = factory.deleteOne(UserDocument);

exports.updateUserDocument = catchAsync(async (req, res, next) => {
  let document = await UserDocument.findOne({
    where: {UserId: req.params.id, DocumentTypeId: req.body.DocumentTypeId}
  });
  console.log(req.body.documents);
  if (req.body.documents.length === 0) {
    document = await document.destroy();
  } else {
    document.documents = req.body.documents;
    await document.save();
  }
  return res.json({
    status: 'success',
    results: document.length,
    data: document
  });
});
