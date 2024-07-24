const express = require('express');

const authController = require('../controllers/auth.controller');
const bugOrIdeaController = require('../controllers/bugOrIdea.controller');

const router = express.Router();

router.post(
  '/',
  bugOrIdeaController.sendTelegramAfterCreating,
  bugOrIdeaController.createBugOrIdea
);

router.use(authController.protect);
router.route('/').get(bugOrIdeaController.getAllBugOrIdeas);
router.route('/:id').get(bugOrIdeaController.getBugOrIdeaById);

router.use(authController.allowedTo(['administrator', 'superAdmin']));

router
  .route('/:id')
  .delete(bugOrIdeaController.deleteBugOrIdea)
  .patch(bugOrIdeaController.updateBugOrIdea);

module.exports = router;
