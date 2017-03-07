# Ewokese Express Sever
Backend for [Ewokese App](https://github.com/jpke/spaced-rep-deploy)


## API Reference
#### The client side code can be found [here](https://github.com/jpke/spaced-rep-deploy)

* GET /auth/google   :: initial OAuth2 request
* GET /auth/google/callback  :: successful OAuth2 redirects here, which returns access token to user
* GET /question      :: returns first quiz question of page quiz session for user
* PUT /question      :: accepts user response to question
  * if correct, increases question mValue
  * if incorrect mValue remains unchanged
  * question placed in approprite bin of queue
  * quesetion at top of queue returned
* POST /demo/user :: creates new demo user and returns demo id
* GET /demo/question :: returns first quiz question to demo user
* PUT /demo/question :: accepts demo user response to question
  * if correct, increases question mValue
  * if incorrect mValue remains unchanged
  * question placed in approprite bin of queue
  * quesetion at top of queue returned






## Use

To run this server for development, simply:
- clone this repo
- cd into repo, then run `npm install`
- obtain OAuth2 credentials through the [Google API console](https://developers.google.com/identity/protocols/OAuth2)
- add `.env` file, containing:
  - `CLIENT_ID` :: Google application id
  - `CLIENT_SECRET` :: Google application secret
  - `REDIRECT_URL` :: `'http://localhost:3090/auth/google/callback'`
  - `FRONT_END` :: url to client side development server, such as `http://localhost:3000`
  - `DATABASE_URI` :: connection to your mongo database `'mongodb://<database name>'`
- start server with `node server.js`


##### Contributers
* bsoung
* dennellmarie
* jpke
