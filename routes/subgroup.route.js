const express = require('express');

const authController = require('../controllers/auth.controller');
const subGroupController = require('../controllers/subgroup.controller');

const router = express.Router();

router.route('/').get(subGroupController.getAllSubGroups);
router.route('/:id').get(subGroupController.getSubGroupById);

router.use(authController.protect);

router.post('/', subGroupController.createSubGroup);

module.exports = router;
