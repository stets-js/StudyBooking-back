const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');

const catchAsync = require('../utils/catchAsync');
const { User } = require('../models/relation');

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
