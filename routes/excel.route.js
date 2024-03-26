const express = require('express');

const authController = require('../controllers/auth.controller');
const excelController = require('../controllers/excel.controller');

const router = express.Router();

router.use(authController.protect, authController.allowedTo(['administrator', 'superAdmin']));
router.route('/').get(excelController.createSheet);

module.exports = router;
