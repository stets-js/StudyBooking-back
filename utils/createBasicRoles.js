const { Role } = require('./../models/relation');

const createRolesIfNotExists = async () => {
	try {
		const basicRoles = [
			{ name: 'teacher', description: 'teacher role' },
			{ name: 'administrator', description: 'Admin role' },
		];

		for (const role of basicRoles) {
			await Role.findOrCreate({
				where: { name: role.name },
				defaults: role,
			});
		}

		console.log('Basic roles checked and created if needed!');
	} catch (error) {
		console.error('Error creating roles:', error);
	}
};

module.exports = createRolesIfNotExists;
