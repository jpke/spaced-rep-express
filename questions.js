var mongoose = require('mongoose');

var questionsSchema = new mongoose.Schema({
	question: {
		type: String,
		required: true
	},
	answer: {
		type: String,
		required: true
	},
	mValue: {
		type: Number,
		required: true
	}
})

var Questions = mongoose.model('Questions', questionsSchema);
module.exports = Questions;