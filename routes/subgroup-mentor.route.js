const express = require('express');

const authController = require('../controllers/auth.controller');
const subgroupMentorController = require('../controllers/subgroup-mentor.controller');
const whereClauseGenerator = require('../utils/whereClauseGenerator');

const router = express.Router();

router.route('/').get(whereClauseGenerator, subgroupMentorController.getAllSubgroupsMentor);
router.route('/').post(whereClauseGenerator, subgroupMentorController.createSubgroupMentor);
router.route('/:subgroupId/:mentorId').delete(subgroupMentorController.deleteSubgroupMentor);
module.exports = router;
