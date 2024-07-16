const Report = require('../models/report.model');
const factory = require('./factory.controller');

exports.getAllReports = factory.getAll(Report);

exports.getReportById = factory.getOne(Report);

exports.createReport = factory.createOne(Report);

exports.deleteReport = factory.deleteOne(Report);

exports.updateReport = factory.updateOne(Report);
