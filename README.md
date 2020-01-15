# Solution for PayPay Full Stack Developer Challenge

## My Assumptions
* 3 views / sections have been created (2 admin views, 1 employee view)
* Admin Views:
  * Employee Management (Add, Update, Delete Employees) [/employee]
  * Performance Review Management (Add, Update, Delete Review, Assign Employees for Feedback on Review) [/review]
* Employee Views:
  * Provide Feedback on Employee Review (List of Feedback requiring selected employee's feedback, update & delete feedback) [/feedback]

## Technologies Used
* Language Used: JavaScript
* JS Framework: Vue.JS / Node.js / NuxtJS / VueX
* Front end framework: Vuetify.JS
* Deployment platform: Heroku (https://paypay-challenge.herokuapp.com/)
* Backend / DB platform: MySQL (via https://remotemysql.com)
* Database Structure:
  * Employee Table
  * Review Table
  * Feedback Table
* Server side API: Fastify via NuxtJS
  * /api/employee [GET, POST, PATCH, DELETE]
  * /api/review [GET, POST, PATCH, DELETE]
  * /api/feedback [GET, POST, PATCH, DELETE]

## Build Setup

``` bash
# install dependencies
$ npm run install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## Assumptions
Design a web application that allows employees to submit feedback toward each other's performance review.

*Partial solutions are acceptable.*  It is not necessary to submit a complete solution that implements every requirement.

### Admin view
* Add/remove/update/view employees
* Add/update/view performance reviews
* Assign employees to participate in another employee's performance review

### Employee view
* List of performance reviews requiring feedback
* Submit feedback

## Challenge Scope
* High level description of design and technologies used
* Server side API (using a programming language and/or framework of your choice)
  * Implementation of at least 3 API calls
  * Most full stack web developers at PayPay currently use Java, Ruby on Rails, or Node.js on the server(with MySQL for the database), but feel free to use other tech if you prefer
* Web app
  * Implementation of 2-5 web pages using a modern web framework (e.g. React or Angular) that talks to server side
    * This should integrate with your API, but it's fine to use static responses for some of it 
* Document all assumptions made
* Complete solutions aren't required, but what you do submit needs to run.

## How to complete this challenge
* Fork this repo in github
* Complete the design and code as defined to the best of your abilities
* Place notes in your code to help with clarity where appropriate. Make it readable enough to present to the PayPay interview team
* Complete your work in your own github repo and send the results to us and/or present them during your interview

## What are we looking for? What does this prove?
* Assumptions you make given limited requirements
* Technology and design choices
* Identify areas of your strengths
* This is not a pass or fail test, this will serve as a common ground that we can deep dive together into specific issues
