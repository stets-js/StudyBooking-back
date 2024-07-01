const express = require('express');

const authController = require('../controllers/auth.controller');
const subgroupMentorController = require('../controllers/subgroup-mentor.controller');
const whereClauseGenerator = require('../utils/whereClauseGenerator');

const router = express.Router();
router.use(authController.protect);
router
  .route('/')
  .get(whereClauseGenerator, subgroupMentorController.getAllSubgroupsMentor)
  .post(whereClauseGenerator, subgroupMentorController.createSubgroupMentor)
  .patch(subgroupMentorController.updateSubgroupMentor);
router.route('/:subgroupId/:mentorId').delete(subgroupMentorController.deleteSubgroupMentor);
module.exports = router;
