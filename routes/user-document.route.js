const express = require('express');

const authController = require('../controllers/auth.controller');
const userDocumentController = require('../controllers/user-document.controller');
const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(userDocumentController.getAllUserDocuments)
  .post(userDocumentController.createUserDocument);

router
  .route('/:id') // id - userId
  .get(userDocumentController.getUserDocumentsByUserId)
  .post(userDocumentController.addUserDocument)
  .patch(userDocumentController.updateUserDocument)
  .delete(userDocumentController.deleteUserDocument);

module.exports = router;
