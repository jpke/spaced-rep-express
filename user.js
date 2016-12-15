var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	name: {
		type: String
	},
	token: {
		type: String,
		required: true
	},
	questions: {
		type: mongoose.Schema.Types.Mixed,
		required: true
	}
})

var User = mongoose.model('User', userSchema);
module.exports = User;