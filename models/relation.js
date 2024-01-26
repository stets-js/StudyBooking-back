const User = require('./user.model');
const Role = require('./role.model');

User.belongsTo(Role);
Role.hasMany(User);
module.exports = { User, Role };
