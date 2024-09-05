const express = require('express');
const router = express.Router();
const {
  getSurveyWithQuestions,
  createAnswer,
  createSurvey,
  createQuestion,
  createAnswersBulk,
  userAnsweredSurvey
} = require('../controllers/survey.controller');
const {protect} = require('../controllers/auth.controller');

router.use(protect);
router.route('/questions').post(createQuestion);

router.route('/answers').post(createAnswer);
router.route('/answers/bulk').post(createAnswersBulk);

router.route('/').post(createSurvey);
router.route('/:id').get(getSurveyWithQuestions).post(userAnsweredSurvey);

module.exports = router;
