# TweetApp
## Productive URL 
https://juli-tweet-app.herokuapp.com/

## Technology stack
- NodeJS
- Express.js
- Javascript
- HTML
- EJS
- MongoDB

## Features
- Session Management.
- Be able to create, edit and delete posts.
- Follow people registered in the app.
- Be followed by other people.
- Live Search where you can search posts from people who you don’t follow.
- Chat icon to chat with other people that are online on the APP.
- HomePage with the newest posts from people you follow.
- Profile page with summarize of your posts, followers and followings.
- Live Validation for Registration form.

## Security
- User Passwords are hash before inserted to DB, so they are encripted and inaccessible.
- User sessions stored on MongoDB.
- Cross Site Request Forgery prevented with CSRF token.
- Sanitize HTML.
- Log in authentication with stricted validations.

## Additional Comments
Please note that photo display in your profile will be the same as you Email’s registration photo.
