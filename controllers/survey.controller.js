const {Survey, Question, Answer} = require('../models/survey.model');
const catchAsync = require('../utils/catchAsync');

exports.createSurvey = catchAsync(async (req, res) => {
  const {title, description, questions} = req.body;

  const survey = await Survey.create({title, description});

  res.status(201).json(survey);
});

exports.createQuestion = catchAsync(async (req, res) => {
  const {surveyId, questions, type} = req.body;

  // Создаем вопрос и связываем его с опросом
  const createdQuestions = Promise.all(
    questions.map(async text => {
      return Question.create({
        text,
        type,
        SurveyId: surveyId
      });
    })
  );

  res.status(201).json(createdQuestions);
});

exports.createAnswer = catchAsync(async (req, res) => {
  const {response, userId, questionId} = req.body;

  const answer = await Answer.create({
    response,
    UserId: userId,
    QuestionId: questionId
  });

  res.status(201).json(answer);
});

exports.getSurveyWithQuestions = catchAsync(async (req, res) => {
  const {id} = req.params;

  const survey = await Survey.findByPk(id, {
    include: [
      {
        model: Question
      }
    ]
  });

  if (!survey) {
    return res.status(404).json({error: 'Опрос не знайдений'});
  }

  res.status(200).json(survey);
});
