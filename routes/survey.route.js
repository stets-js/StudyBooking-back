const express = require('express');
const router = express.Router();
const {
  getSurveyWithQuestions,
  createAnswer,
  createSurvey,
  createQuestion,
  createAnswersBulk
} = require('../controllers/survey.controller');

router.route('/').post(createSurvey);
router.route('/:id').get(getSurveyWithQuestions);

router.route('/questions').post(createQuestion);

router.route('/answers').post(createAnswer);
router.route('/answers/bulk').post(createAnswersBulk);

module.exports = router;
