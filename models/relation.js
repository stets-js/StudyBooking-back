const User = require('./user.model');
const Role = require('./role.model');

User.belongsTo(Role);
Role.hasMany(User);

User.beforeFind(async (options) => {
	options.attributes = options.attributes || {};
	options.attributes.exclude = options.attributes.exclude || [];

	options.include = options.include || [];
	options.include.push({
		model: Role,
		attributes: ['id', 'name'],
	});
});

module.exports = { User, Role };
