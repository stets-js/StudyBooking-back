const express = require('express');

const authController = require('../controllers/auth.controller');
const slotController = require('../controllers/slot.controller');
const whereClauseGenerator = require('../utils/whereClauseGenerator');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, whereClauseGenerator, slotController.getAllSlots)
  .post(authController.protect, whereClauseGenerator, slotController.getAllSlots);

router.patch(
  '/bulk',
  authController.protect,
  // authController.allowedTo('administrator'),
  slotController.bulkUpdate
);
router.use(authController.protect, authController.allowedTo(['administrator', 'superAdmin']));
router
  .route('/:id')
  .get(slotController.getSlotById)
  .delete(slotController.deleteSlot)
  .patch(slotController.updateSlot);
module.exports = router;
