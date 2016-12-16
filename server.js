// require("dotenv").config();
var CLIENT_ID  = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET;
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var Strategy = require('passport-http-bearer').Strategy;
var bodyParser = require('body-parser');
var cors = require('cors');
var http = require('http');
var User = require('./user');
var Questions = require('./questions');
var path = require('path');

var app = express();
app.use(cors());
app.use(express.static( '../build'));
var jsonParser = bodyParser.json();

passport.serializeUser(function(user, done) {
	done(null, user)
})

passport.deserializeUser(function(user, done) {
	done(null, user);
})

passport.use(new Strategy(
  function(token, done) {
    User.findOne({ token: token }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user, { scope: 'all' });
    });
  }
));

app.use(passport.initialize());

app.get('/*', function (req, res) {
   res.sendFile(path.join(__dirname, './build', 'index.html'));
 });

app.get('/question', passport.authenticate('bearer', { session: false }), function(req, res) {
	var accessToken = req.headers.authorization.split(' ')[1]
	User.find({token: accessToken}, {questions: 1}, function(err, data) {
		if (err) {
			console.error(err)
			return res.status(500).json('Internal Server Error')
		}
		Questions.find({_id: data[0].questions[0]._id}, function(err, newQuestion) {
			if (err) {
				console.error(err)
				return res.status(500).json('Internal Server Error')
			}
			return res.status(200).json(newQuestion)
		})
	})
})

app.put('/question', jsonParser, passport.authenticate('bearer', { session: false }), function(req, res) {
	var accessToken = req.headers.authorization.split(' ')[1]
	User.find({token: accessToken}, function(err, data) {
		if (err) {
			console.error(err)
			return res.status(500).json('Internal Server Error')
		}
		let isCorrect = req.body.isCorrect
		let dataToUpdate = data[0].questions
		if(dataToUpdate[0]._id == req.body._id) {
			if(isCorrect) {
				if(dataToUpdate[0].mValue === 1) {
					dataToUpdate[0].mValue = 3
				}
				else {
					dataToUpdate[0].mValue = dataToUpdate[0].mValue * 2
				}
			}
		}
		else {
			console.error(err)
			res.status(500).json("Internal Data Error")
		}

		updatedQuestionOrder = dataToUpdate.slice(1, dataToUpdate[0].mValue + 1)
		updatedQuestionOrder.push(dataToUpdate[0])
		updatedQuestionOrder = updatedQuestionOrder.concat(dataToUpdate.slice((dataToUpdate[0].mValue + 1), dataToUpdate.length))

		User.findById(data[0]._id, function(err, updatedData) {
			if(err) {
				console.log("err:", err);
			}
			updatedData.questions = updatedQuestionOrder
			// console.log("updatedData", updatedData.questions);
			updatedData.save(function(err, newData) {
				if(err) {
					res.status(500).send(err)
				}
				else {
					Questions.find({_id: newData.questions[0]._id}, function(err, question) {
						if(err) {
							console.error(err)
							res.status(500).json('Question db error')
						}
						res.status(200).json(question)
					})
				}
			})
		})
	})
})

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'https://intense-wildwood-92655.herokuapp.com/auth/google/callback'
);

app.get('/auth/google', function(req, res) {
	var url = oauth2Client.generateAuthUrl({
	  // If you only need one scope you can pass it as string
	  scope: 'profile'
	});
	res.redirect(url);
});

app.get('/auth/google/callback', function(req, res) {
	oauth2Client.getToken(req.query.code, function (err, tokens) {
	  // Now tokens contains an access_token and an optional refresh_token. Save them.
	  	if (!err) {
		    //oauth2Client.setCredentials(tokens);
		    User.findOne({ token: tokens.access_token }, function (err, user) {
				if (!err) {
					if (!user) {
						user = new User()
						user.token = tokens.access_token
						Questions.find({}, {_id: 1, mValue: 1}, function(err, data) {
							console.log('DATA:::', data)
							user.questions = data
							user.save(function(err) {
								if (!err) {
								console.log('user created')
								}
							}).then(function() {
							res.cookie('accessToken', tokens.access_token).redirect("https://enigmatic-refuge-11264.herokuapp.com/");
							})	
						})
					} else {
						res.cookie('accessToken', tokens.access_token).redirect("https://enigmatic-refuge-11264.herokuapp.com/");
					}
				}
		    });
  		} else {
  			res.status(500).json({'error': err});
  		}
	});
})



var databaseURI = process.env.DATABASE_URI || 'mongodb://<database name>';
mongoose.connect(databaseURI).then(function() {
	//User.remove({});
	var port = process.env.PORT || 3090;
	var server = http.createServer(app);
	server.listen(port);
	console.log('Server listening on ', port);
}).catch(function(error) {
	console.log('Server error: ', error);
})


