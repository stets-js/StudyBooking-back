const {format, sub} = require('date-fns');

const factory = require('./factory.controller');
const {SubGroup, SubgroupMentor, User, TeacherType} = require('../models/relation');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');
exports.getAllSubGroups = factory.getAll(SubGroup);

exports.getSubGroupById = catchAsync(async (req, res, next) => {
  const document = await SubGroup.findOne({
    where: {id: req.params.id},
    include: [
      {
        model: SubgroupMentor,
        required: false,
        include: [User, TeacherType]
      }
    ]
  });
  if (!document) {
    return res.status(404).json({message: `No document find with id ${req.params.id}`});
  }
  res.json({
    status: 'success',
    data: document
  });
});

exports.createSubGroup = factory.createOne(SubGroup);

exports.deleteSubGroup = factory.deleteOne(SubGroup);

exports.updateSubGroupAndAddMentor = catchAsync(async (req, res, next) => {
  // for now its updating subgroup + creating new row in SubgroupMentor
  let id = req.params.id;
  const body = req.body;
  const subgroup = await SubGroup.update(body, {where: {id}});
  const subgroupMentor = await SubgroupMentor.create(req.body);
  let message = '';
  let subject = '';
  message = `<div styles="font-family:"Poppins", sans-serif; font-size:20px;><h3>Вас було призначено на потік!<h3>
    <h4>Дата ${format(req.body.startDate, 'yyyy-MM-dd')}, - ${format(
    req.body.endDate,
    'yyyy-MM-dd'
  )}</h4>
    <div>Ваш графік: ${req.body.schedule}.<br>
    Посилання: ${req.body.link}.<br>
   </div>
    </div>
   `;
  subject = 'Вас призначенно на новий потік!';

  try {
    const user = await User.findByPk(subgroupMentor.mentorId);
    if (user) {
      await sendEmail({
        email: user.email,
        subject,
        html: message
      });
    }
  } catch (e) {}
  res.json({
    data: subgroup,
    subgroupMentor
  });
});

exports.updateSubGroup = catchAsync(async (req, res, next) => {
  // for now its updating subgroup + creating new row in SubgroupMentor
  let id = req.params.id;
  const body = req.body;
  const subgroup = await SubGroup.update(body, {where: {id}});

  res.json({
    data: subgroup
  });
});
