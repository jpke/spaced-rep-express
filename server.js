require("dotenv").config({silent: true});
var CLIENT_ID  = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET;
var REDIRECT_URL = process.env.REDIRECT_URL;
var FRONT_END = process.env.FRONT_END;
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
var fs = require('fs');

var app = express();
app.use(cors());
app.use(express.static( './build'));
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

// app.get('/*', function (req, res) {
//    res.sendFile(path.join(__dirname, './build', 'index.html'));
//  });

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
		var isCorrect = req.body.isCorrect
		var dataToUpdate = data[0].questions
		console.log("Prior Question Order: ", dataToUpdate)
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

// var google = require('googleapis');
// var OAuth2 = google.auth.OAuth2;

// var oauth2Client = new OAuth2(
//   CLIENT_ID,
//   CLIENT_SECRET,
//   REDIRECT_URL
// );

// app.get('/auth/google', function(req, res) {
// 	console.log("auth/google endpoint accessed", REDIRECT_URL)
// 	var url = oauth2Client.generateAuthUrl({
// 	  // If you only need one scope you can pass it as string
// 	  scope: 'profile'
// 	});
// 	res.redirect(url);
// });

// app.get('/auth/google/callback', function(req, res) {
// 	oauth2Client.getToken(req.query.code, function (err, tokens) {
// 		console.log(FRONT_END.concat("/access_token?"+ tokens.access_token))
// 	  // Now tokens contains an access_token and an optional refresh_token. Save them.
// 	  	if (!err) {
// 		    //oauth2Client.setCredentials(tokens);
// 		    User.findOne({ name: profile.id }, function (err, user) {
// 					if (!err) {
// 						if (!user) {
// 							console.log("new user CREATED")
// 							user = new User()
// 							user.name = profile.id
// 							user.token = tokens.access_token
// 							Questions.find({}, {_id: 1, mValue: 1}, function(err, data) {
// 								user.questions = data
// 								user.save(function(err) {
// 									if (!err) {
// 									console.log('user created')
// 									}
// 								}).then(function() {
// 								res.redirect(FRONT_END.concat("/#/access_token?"+ tokens.access_token))
// 								})	
// 							})
// 						} else {
// 							user.token = tokens.access_token
// 							user.save(function(err) {
// 								if(!err) {
// 									console.log('user access token updated')
// 								}
// 							}).then(function() {
// 								res.redirect(FRONT_END.concat("/#/access_token?"+ tokens.access_token))
// 								})
// 						}
// 					}
// 		    });
//   		} else {
//   			res.status(500).json({'error': err});
//   		}
// 	});
// })


var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: REDIRECT_URL
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOne({ name: profile.id }, function (err, user) {
			if (!err) {
				if (!user) {
					console.log("new user CREATED")
					user = new User()
					user.name = profile.id
					user.token = accessToken
					Questions.find({}, {_id: 1, mValue: 1}, function(err, data) {
						user.questions = data
						user.save(function(err) {
							if (!err) {
							console.log('user created')
							}
						}).then(function() {
							return cb(err, user);
						// res.redirect(FRONT_END.concat("/#/access_token?"+ tokens.access_token))
						})	
					})
				} else {
					user.token = accessToken
					user.save(function(err) {
						if(!err) {
							console.log('user access token updated')
						}
					}).then(function() {
						return cb(err, user);
						// res.redirect(FRONT_END.concat("/#/access_token?"+ tokens.access_token))
						})
				}
			}
    });
  }
));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback/', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
  	console.log("THIS RAN!")
  	console.log("REQ UESR: ", req.user)
    res.redirect(FRONT_END.concat("/#/access_token?"+ req.user.token))
  });

var databaseURI = process.env.DATABASE_URI || 'mongodb://<database name>';
mongoose.connect(databaseURI).then(function() {
	var port = process.env.PORT || 3090;
	var server = http.createServer(app);
	server.listen(port);
	console.log('Server listening on ', port);
}).catch(function(error) {
	console.log('Server error: ', error);
})


