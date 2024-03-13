const express = require('express');

const authController = require('../controllers/auth.controller');
const roleController = require('../controllers/role.controller');
const whereClauseGenerator = require('../utils/whereClauseGenerator');

const router = express.Router();

router.route('/').get(whereClauseGenerator, roleController.getAllRoles);
router.route('/:id').get(roleController.getRoleById);

router.use(authController.protect, authController.allowedTo(['administrator', 'superAdmin']));

router.post('/', roleController.createRole);

router.route('/:id').delete(roleController.deleteRole).patch(roleController.updateRole);

module.exports = router;
