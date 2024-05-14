const express = require('express');

const authController = require('../controllers/auth.controller');
const slotController = require('../controllers/slot.controller');
const lessonController = require('../controllers/lesson.controller');
const whereClauseGenerator = require('../utils/whereClauseGenerator');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, whereClauseGenerator, slotController.getAllSlots)
  .post(whereClauseGenerator, slotController.getAllSlots);

router
  .route('/bulk')
  .patch(
    authController.protect,
    // authController.allowedTo('administrator'),
    // slotController.bulkUpdate,
    slotController.bulkRemove,
    lessonController.bulkCreate,
    slotController.CreateSlotsAfterSubgroup
  )
  .post(slotController.bulkCreate);

router.use(authController.protect, authController.allowedTo(['administrator', 'superAdmin']));
router
  .route('/:id')
  .get(slotController.getSlotById)
  .delete(slotController.deleteSlot)
  .patch(slotController.updateSlot);
module.exports = router;
