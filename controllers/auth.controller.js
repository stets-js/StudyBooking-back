const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
const { promisify } = require('util');

const catchAsync = require('../utils/catchAsync');
const { User, Role } = require('../models/relation');

const timeLeftTillMorning = () => {
	const nowInKiev = moment().tz('Europe/Kiev');
	const expiryTime = nowInKiev.clone().add(1, 'days').startOf('day').hour(8);

	return expiryTime.diff(nowInKiev, 'seconds');
};

const signToken = (id, timeTillMorning) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: timeTillMorning,
	});
};

const createSendToken = (user, statusCode, res) => {
	const timeTillMorning = timeLeftTillMorning();
	const token = signToken(user.id, timeTillMorning);
	const cookieOptions = {
		expires: new Date(Date.now() + timeTillMorning),
		httpOnly: true,
	};
	res.cookie('jwt', token, cookieOptions);
	user.password = undefined;
	res.status(statusCode).json({
		status: 'success',
		token,
		user,
	});
};

exports.login = catchAsync(async (req, res) => {
	const { login, password } = req.body;

	const user = await User.findOne({
		where: { login },
	});

	if (!user || !(await user.verifyPassword(password)))
		return res.status(401).json({ message: 'Invalid credentials' });

	createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
	try {
		res.clearCookie('jwt');
		res.status(200).json({
			message: 'Logged out successfully',
		});
	} catch (error) {
		res.status(500).json({
			message: 'something went wrong',
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
	const freshUser = await User.findByPk(1, {});

	if (!freshUser) return next('This user was deleted');

	// Access to protected route
	req.user = freshUser;
	next();
});

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.Role.name)) {
			return next('You dont have permision :(');
		}
		next();
	};
};
