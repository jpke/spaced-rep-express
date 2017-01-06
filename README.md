# Ewokese

A long time ago in a galaxy far, far away... Ewoks existed. Use this app to brush up on your Ewokese! 



## Motivation

* Spaced repetition is a method for efficient learning that has you practice concepts or skills over increasing periods of time. It's based on the notion of a "forgetting curve," or the idea that over time, if we don't actively use or reflect on something we know, our knowledge decays. With spaced repetition, we stay ahead of that moment of forgetting, but we do it in a smart way: if we know something, we don't need to practice it for some period of time. If we don't know something, we do need to practice it.
* For example, let's say that you wanted to learn four new words, A, B, C and D. Using spaced repetition you might test the words in this order: ABABCACBDCADB...
* Notice how the spacing between the questions gets longer as you go on. So subsequent tests on question A are separated by one question (B), then two questions (BC), then four questions (CBDC). And the same thing happens with question B and question C. If you got one of the questions wrong then you would reduce the spacing for that question to make sure that the correct answer is.
* The algorithm will place the question you answer correctly three slots back, while the incorrectly answered question immediately following the next. This will reinforce a user's retention of Ewokese.
* Users must sign in with Google for access, and then have the ability to study online, print flash cards, and take the quiz.




## Technologies

* React
* Redux
* JavaScript
* CSS
* Google OAuth2
* MongoDB



## API Reference

* GET /question      :: returns all questions
* GET /auth/google   :: initial authentication request
* GET /auth/google/  :: Google authenticates
  callback    
* PUT /question      :: updates questions array  




## Use

* To use this app, you must clone this repository and the one found at https://github.com/jpke/spaced-rep-deploy. You have to obtain credentials from Google for authentication access. You can find a guideline here:  https://developers.google.com/identity/protocols/OAuth2 . 



##### Contributers
* bsoung
* dennellmarie
* jpke
