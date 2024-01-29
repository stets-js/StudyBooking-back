const express = require('express');

const authController = require('../controllers/auth.controller');
const roleController = require('../controllers/role.controller');

const router = express.Router();

router.route('/').get(roleController.getAllRoles);
router.route('/:id').get(roleController.getRoleById);

router.use(authController.protect);

router.post('/', roleController.createRole);

//   .delete(roleController.deleteRole)
//   .patch(roleController.updateRole);

module.exports = router;
