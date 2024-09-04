const express = require('express');
const router = express.Router();
const {
  getSurveyWithQuestions,
  createAnswer,
  createSurvey,
  createQuestion
} = require('../controllers/survey.controller');

router.route('/surveys').post(createSurvey);

router.route('/questions').post(createQuestion);

router.route('/answers').post(createAnswer);

router.route('/surveys/:id').get(getSurveyWithQuestions);

module.exports = router;
