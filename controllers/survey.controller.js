const {Survey, Question, Answer} = require('../models/survey.model');
const catchAsync = require('../utils/catchAsync');

exports.createSurvey = catchAsync(async (req, res) => {
  const {title, description, questions} = req.body;

  const survey = await Survey.create({title, description});

  res.status(201).json(survey);
});

exports.createQuestion = catchAsync(async (req, res) => {
  const {surveyId, questions} = req.body;
  // Создаем вопрос и связываем его с опросом
  const createdQuestions = Promise.all(
    questions.map(async question => {
      return Question.create({
        text: question.text,
        type: question.type,
        answers: question.answers,
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

exports.createAnswersBulk = catchAsync(async (req, res) => {
  const {userId, SurveyId, answers} = req.body;

  const answersData = Object.keys(answers).map(questionId => ({
    response: answers[questionId],
    UserId: userId,
    SurveyId,
    QuestionId: questionId
  }));
  const createdAnswers = await Answer.bulkCreate(answersData);

  res.status(201).json(createdAnswers);
});

exports.getSurveyWithQuestions = catchAsync(async (req, res) => {
  const {id} = req.params;

  const survey = await Survey.findByPk(id, {
    include: [
      {
        model: Question,
        separate: true,
        order: [['id', 'ASC']]
      }
    ],
    order: [['createdAt', 'ASC']]
  });

  if (!survey) {
    return res.status(404).json({error: 'Опрос не знайдений'});
  }

  res.status(200).json(survey);
});

exports.userAnsweredSurvey = catchAsync(async (req, res) => {
  const {id} = req.params;

  const isAnswered = await Answer.findOne({
    where: {UserId: req.user.id, SurveyId: id}
  });
  res.status(200).json({isAnswered: isAnswered ? true : false});
});
