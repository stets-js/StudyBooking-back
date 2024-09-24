const express = require('express');

const authController = require('../controllers/auth.controller');
const subGroupController = require('../controllers/subgroup.controller');
const whereClauseGenerator = require('../utils/whereClauseGenerator');

const router = express.Router();

router.get('/zoho', subGroupController.readCsvZohoSubgroups);

router.route('/telegram').post(subGroupController.sendTelegram);
router.route('/').get(whereClauseGenerator, subGroupController.getAllSubGroups);
router.route('/:id').get(subGroupController.getSubGroupById);
router.use(authController.protect);

router.post('/', subGroupController.createSubGroup);

// this case of Updating subgroup + creating mentorSubgroup row
router
  .route('/:id/creation')
  .patch(subGroupController.updateSubGroupAndNext, subGroupController.addMentorToSubgroup);

router
  .route('/:id')
  .delete(subGroupController.deleteSubGroup)
  .patch(subGroupController.updateSubGroup);
router.route('/:id/json').get(subGroupController.subgroupJSON);
router.post('/add_subgroups_from_zoho', subGroupController.addSubgroupsFromZoho);

module.exports = router;
