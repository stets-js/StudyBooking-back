const express = require('express');

const authController = require('../controllers/auth.controller');
const reportController = require('../controllers/report.controller');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(reportController.getAllReports)
  .post(authController.allowedTo(['QC manager', 'superAdmin']), reportController.createReport);

router
  .route('/:id')
  .get(reportController.getReportById)
  .patch(reportController.updateReport)
  .delete(authController.allowedTo(['QC manager', 'superAdmin']), reportController.deleteReport);

router.use(authController.allowedTo(['administrator', 'superAdmin']));

module.exports = router;
