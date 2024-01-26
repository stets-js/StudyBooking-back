const { User, Role } = require('../models/relation');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factory.controller');

exports.getAllUsers = factory.getAll(User);

exports.getUserById = factory.getOne(User);

exports.createUser = factory.createOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.updateUser = factory.updateOne(User);
