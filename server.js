var GoogleStrategy = require('passport-google-oauth20').Strategy;
require("dotenv").config();
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

// var questions = [
//     {
//       question: "Wermo",
//       answer: "A stupid person",
//       mValue: 1
//     },
//     {
//       question: "Ee chee wa maa!",
//       answer: "Gee whiz",
//       mValue: 1
//     },
//     {
//       question: "Kna Naa",
//       answer: "Spirit tree",
//       mValue: 1
//     },
//     {
//       question: "Jeerota",
//       answer: "Friend",
//       mValue: 1
//     },
//     {
//       question: "Kreeth",
//       answer: "Cave",
//       mValue: 1
//     },
//     {
//       question: "Mookiee",
//       answer: "Female baby Ewok",
//       mValue: 1
//     },
//     {
//       question: "Nuv",
//       answer: "Love",
//       mValue: 1
//     },
//     {
//       question: "Ooba",
//       answer: "Sweet",
//       mValue: 1
//     },
//     {
//       question: "Powa",
//       answer: "Power",
//       mValue: 1
//     },
//     {
//       question: "Roda",
//       answer: "To eat",
//       mValue: 1
//     },
//     {
//       question: "Sheeu",
//       answer: "Name",
//       mValue: 1
//     },
//     {
//       question: "Shetai",
//       answer: "Warrior",
//       mValue: 1
//     },
//     {
//       question: "Sku",
//       answer: "Hello",
//       mValue: 1
//     },
//     {
//       question: "Sleesh",
//       answer: "Berry",
//       mValue: 1
//     },
//     {
//       question: "Sunee",
//       answer: "Sun",
//       mValue: 1
//     },
//     {
//       question: "Teeha",
//       answer: "Thank you",
//       mValue: 1
//     },
//     {
//       question: "Teeket",
//       answer: "Heart",
//       mValue: 1
//     },
//     {
//       question: "Sut",
//       answer: "Soon",
//       mValue: 1
//     },
//     {
//       question: "Thek",
//       answer: "Here",
//       mValue: 1
//     },
//     {
//       question: "Thees",
//       answer: "Good",
//       mValue: 1
//     },
//     {
//       question: "T'hesh",
//       answer: "Quiet",
//       mValue: 1
//     },
//     {
//       question: "Thuk",
//       answer: "Rock",
//       mValue: 1
//     },
//     {
//       question: "Treek",
//       answer: "Go",
//       mValue: 1
//     },
//     {
//       question: "Treekthin",
//       answer: "Hourney",
//       mValue: 1
//     },
//     {
//       question: "Tu",
//       answer: "The",
//       mValue: 1
//     },
//     {
//       question: "Weewa",
//       answer: "House",
//       mValue: 1
//     },
//     {
//       question: "Yeha",
//       answer: "Goodbye",
//       mValue: 1
//     },
//     {
//       question: "Yehan",
//       answer: "Peace",
//       mValue: 1
//     },
//     {
//       question: "Yesh",
//       answer: "Correct",
//       mValue: 1
//     },
//     {
//       question: "Drin",
//       answer: "Sick",
//       mValue: 1
//     },
//     {
//       question: "Churi",
//       answer: "Mountain",
//       mValue: 1
//     },
//     {
//       question: "Dutak",
//       answer: "Arrow",
//       mValue: 1
//     },
//     {
//       question: "Eleeo",
//       answer: "Never",
//       mValue: 1
//     },
//     {
//       question: "Ehda",
//       answer: "Evil",
//       mValue: 1
//     }
//   ]

//   questions.forEach(function(item) {
//   	Questions.create({
//   		question: item.question,
//   		answer: item.answer,
//   		mValue: item.mValue
//   	}, function() {
//   		return
//   	})
//   })

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
  'http://localhost:3090/auth/google/callback'
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
							res.cookie('accessToken', tokens.access_token).redirect("http://localhost:3000");
							})	
						})
					} else {
						res.cookie('accessToken', tokens.access_token).redirect("http://localhost:3000");
					}
				}
		    });
  		} else {
  			res.status(500).json({'error': err});
  		}
	});
})



var databaseURI = process.env.DATABASE_URI || 'mongodb://ewok:ewok@ds133368.mlab.com:33368/ewokese';
mongoose.connect(databaseURI).then(function() {
	//User.remove({});
	var port = process.env.port || 3090;
	var server = http.createServer(app);
	server.listen(port);
	console.log('Server listening on ', port);
}).catch(function(error) {
	console.log('Server error: ', error);
})


