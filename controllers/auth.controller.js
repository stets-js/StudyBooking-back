const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
const {promisify} = require('util');
const sendEmail = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const {User, Role} = require('../models/relation');

const timeLeftTillMorning = () => {
  const nowInKiev = moment().tz('Europe/Kiev');
  const expiryTime = nowInKiev.clone().add(1, 'days').startOf('day').hour(8);

  return expiryTime.diff(nowInKiev, 'seconds');
};

const signToken = (user, timeTillMorning) => {
  return jwt.sign(
    {id: user.id, user_name: user.name, role: user.Role.name, roleId: user.Role.id},
    process.env.JWT_SECRET,
    {
      expiresIn: timeTillMorning
    }
  );
};

const createSendToken = (user, statusCode, res) => {
  const timeTillMorning = timeLeftTillMorning();
  const token = signToken(user, timeTillMorning);
  const cookieOptions = {
    expires: new Date(Date.now() + timeTillMorning),
    httpOnly: true
  };
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    user
  });
};

exports.login = catchAsync(async (req, res) => {
  const {email, password} = req.body;
  console.log(req.body);
  const user = await User.findOne({
    where: {email}
  });

  if (!user || !(await user.verifyPassword(password)))
    return res.status(401).json({message: 'Invalid credentials'});

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  try {
    res.clearCookie('jwt');
    res.status(200).json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'something went wrong'
    });
  }
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next('You are not logged in bro :(');
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const freshUser = await User.findByPk(decoded.id, {});

  if (!freshUser) return next('This user was deleted');

  // Access to protected route
  req.user = freshUser;
  next();
});

exports.allowedTo = roles => {
  return (req, res, next) => {
    if (!roles.includes(req.user.Role.name)) {
      return next('You dont have permision :(');
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //get user based on posted email
  const user = await User.findOne({
    where: {
      email: req.body.email
    }
  });
  if (!user) return res.status(404).json({message: 'cant find user with this email :('});

  // generate random reset token
  const resetToken = jwt.sign({email: req.body.email, id: user.id}, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  //send email

  const resetURL = `${process.env.DEPLOYED_FRONT}/resetPassword/${resetToken}`;

  const message = `Forgot password? Submit a patch request with youer new password and password confirm to: ${resetURL}`; // !!! WRITE SOMETHING MORE COOL
  const html = `<h1>Forgot password?</h1><a href=${resetURL}><button>Click here</button></a>`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset token (24 hours)',
      message,
      html
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
      email: user.email // debug only
    });
  } catch (error) {
    res.status(400).json({
      message: 'something went wrong',
      error
    });
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on token
  if (!req.params.token) return res.status(400).json({message: 'Where is token?'});
  const decoded = await promisify(jwt.verify)(req.params.token, process.env.JWT_SECRET);

  const user = await User.findByPk(decoded.id);
  if (!user) {
    res.status(400).json({message: 'Something wrong with token'});
  }
  // if token !expired, and is user, set new password
  user.password = req.body.password;
  await user.save();

  createSendToken(user, 201, res);
});
