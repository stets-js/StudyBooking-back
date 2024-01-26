const express = require('express');

const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.use(authController.protect, authController.allowedTo('administrator'));

router.route('/').get(userController.getAllUsers).post(userController.createUser);

router
	.route('/:id')
	.get(userController.getUserById)
	.delete(userController.deleteUser)
	.patch(userController.updateUser);

module.exports = router;
