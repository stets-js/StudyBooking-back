const express = require('express');

const authController = require('../controllers/auth.controller');
const spreadsheetController = require('../controllers/spreadsheet.controller');

const router = express.Router();

router.use(authController.protect, authController.allowedTo(['administrator', 'superAdmin']));
router.route('/').get(spreadsheetController.updateSheet);
router.route('/borders').get(spreadsheetController.addBorders);
router.route('/resize').get(spreadsheetController.resize);

module.exports = router;
