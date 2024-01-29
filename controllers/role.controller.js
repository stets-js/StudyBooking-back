const {Role} = require('../models/relation');
const factory = require('./factory.controller');

exports.getAllRoles = factory.getAll(Role);

exports.getRoleById = factory.getOne(Role);

exports.createRole = factory.createOne(Role);

exports.deleteRole = factory.deleteOne(Role);

exports.updateRole = factory.updateOne(Role);
