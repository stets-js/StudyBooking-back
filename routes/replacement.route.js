const express = require('express');

const authController = require('../controllers/auth.controller');
const replacementController = require('../controllers/replacement.controller');
const router = express.Router();
router.use(authController.protect);
router.route('/').get(replacementController.getAllReplacements);
router.route('/:id').get(replacementController.getReplacementById);

router.use(authController.allowedTo('administrator'));

router.post('/', replacementController.createReplacement);
router
  .route('/:id')
  .delete(replacementController.deleteReplacement)
  .patch(replacementController.updateReplacement);

module.exports = router;
