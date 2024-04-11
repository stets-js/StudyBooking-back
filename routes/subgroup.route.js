const express = require('express');

const authController = require('../controllers/auth.controller');
const subGroupController = require('../controllers/subgroup.controller');
const whereClauseGenerator = require('../utils/whereClauseGenerator');

const router = express.Router();

router.route('/').get(whereClauseGenerator, subGroupController.getAllSubGroups);
router.route('/:id').get(subGroupController.getSubGroupById);

router.use(authController.protect);

router.post('/', subGroupController.createSubGroup);

// this case of Updating subgroup + creating mentorSubgroup row
router.route('/:id/creation').patch(subGroupController.updateSubGroupAndAddMentor);

router
  .route('/:id')
  .delete(subGroupController.deleteSubGroup)
  .patch(subGroupController.updateSubGroup);
module.exports = router;
