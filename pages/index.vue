<template>
  <v-container class="grey lighten-5">
    <v-row no-gutters>
      <h2>Assumptions</h2>
    </v-row>
    <ul>
      <li>3 views / sections have been created (2 admin views, 1 employee view)</li>
      <li><h4>Admin Views:</h4></li>
      <li>-- Employee Management (Add/remove/update/view employees) [/employee]</li>
      <li>-- Performance Review Management (Add/update/view performance reviews, Assign employees to participate in another employee's performance review) [/review]</li>
      <li><h4>Employee Views:</h4></li>
      <li>-- Provide Feedback on Employee Review (List of Feedback requiring selected employee's feedback, Submit/update/remove feedback) [/feedback]</li>
    </ul>
    <v-row no-gutters>
      <h2>Technologies Used</h2>
    </v-row>
    <ul>
      <li>Language Used: JavaScript</li>
      <li>JS Framework: Vue.JS / Node.js / NuxtJS / VueX</li>
      <li>Front end framework: Vuetify.JS</li>
      <li>Deployment platform: Heroku (https://paypay-challenge.herokuapp.com/)</li> 
      <li>Backend / DB platform: MySQL (via https://remotemysql.com)</li>
      <li><h4>Database Structure:</h4></li>
      <li>-- Employee Table</li>
      <li>-- Review Table</li>
      <li>-- Feedback Table</li>
      <li><h4>Server side API: Fastify via NuxtJS</h4></li>
      <li>-- /api/employee [GET, POST, PATCH, DELETE]</li>
      <li>-- /api/review [GET, POST, PATCH, DELETE]</li>
      <li>-- /api/feedback [GET, POST, PATCH, DELETE]</li>
    </ul>
  </v-container>
</template>