const {UserDocument} = require('../models/relation');
const factory = require('./factory.controller');

exports.getAllUserDocuments = factory.getAll(UserDocument);

exports.getUserDocumentsByUserId = factory.getOne(UserDocument);
exports.addUserDocument = async (req, res, next) => {
  const documentId = req.body.documentId;
  const userId = req.params.id;

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
    } else {
      // If the user document entry already exists, update it
      userDocument.documents.push(req.body.document);
      await userDocument.save();
    }

    // Respond with success message or updated user document
    res.status(201).json({message: 'Document added successfully', userDocument});
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).json({error: 'Server error'});
  }
};

exports.createUserDocument = factory.createOne(UserDocument);

exports.deleteUserDocument = factory.deleteOne(UserDocument);

exports.updateUserDocument = factory.updateOne(UserDocument);
