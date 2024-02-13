const express = require('express');

const authController = require('../controllers/auth.controller');
const slotController = require('../controllers/slot.controller');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, slotController.getAllSlots)
  .post(authController.protect, slotController.getAllSlots);

module.exports = router;
