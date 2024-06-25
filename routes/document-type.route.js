const express = require('express');

const authController = require('../controllers/auth.controller');
const documentTypeController = require('../controllers/document-type.controller');

const router = express.Router();
router.use(authController.protect);
router.route('/').get(documentTypeController.getAllDocumentTypes);
router.route('/:id').get(documentTypeController.getDocumentTypeById);

router.use(authController.allowedTo(['administrator', 'superAdmin']));

router.post('/', documentTypeController.createDocumentType);
router
  .route('/:id')
  .delete(documentTypeController.deleteDocumentType)
  .patch(documentTypeController.updateDocumentType);

module.exports = router;
