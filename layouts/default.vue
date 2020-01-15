<template>
  <v-app>
    <v-app-bar
      fixed
      app
    >
      <v-icon left>mdi-account-group</v-icon>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <div>
        <v-btn 
          v-for="(item, i) in headerMenuItems"
          :key="i"
          :to="item.to" 
          :color="$router.currentRoute.name == item.routeName ? 'purple' : ''" :href='item.url' text>
          <v-icon left>{{item.routeIcon}}</v-icon>
          {{item.humanName}}
        </v-btn>
      </div>
      <!-- <v-col cols="2">
        <v-select
          :items="employeeList"
          item-text="first_name"
          item-value="emp_id"
          label="Switch Current User"
          :value="currentlySelectedUser"
          @change="switchCurrentUser"
          clearable
          class="mt-6"
        ></v-select>
      </v-col> -->
      <!-- <v-btn class="ma-2" text name="btn_logout" @click="logoutUser">
        <v-icon left>mdi-logout</v-icon> Log out
      </v-btn> -->
    </v-app-bar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      clipped: false,
      drawer: true,
      fixed: false,
      headerMenuItems: [
        {
          routeName: 'home',
          routeIcon: 'mdi-home',
          humanName: 'Home',
          url: '/',
        },
        {
          routeName: 'feedback',
          routeIcon: 'mdi-file-document-box-multiple-outline',
          humanName: 'Employee / Feedback',
          url: '/feedback',
        },
        {
          routeName: 'review',
          routeIcon: 'mdi-trending-up',
          humanName: 'Admin / Performance Reviews',
          url: '/review',
        },
        {
          routeName: 'employee',
          routeIcon: 'mdi-account',
          humanName: 'Admin / Employee Management',
          url: '/employee',
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Employee Portal',
      layoutSearchFilter: ''
    }
  },
  // created: function(){
  //   setTimeout(() => {
  //     this.checkUserAuthStatus();
  //   }, 900);
  // },
  mounted(){
    // this.fetchEmployees();
  },
  watch: {
    // currentUser (val) {
    //   if(!val){
    //     console.log("user logged out successfully!")
    //     this.gotoPage('/login');
    //   }
    //   else{
    //     this.gotoPage('/');
    //   }
    // }
  },
  computed: {
    currentUser(){
      // return this.$store.state.emp_review_feedback.currentlyAuthenticatedEmployee;
      console.log("#### THIS IS THE CURRENT EMPLOYEE: ", this.$store.state.emp_review_feedback.currentEmployee);
      return this.$store.state.emp_review_feedback.currentEmployee;
    },
    currentlySelectedUser(){
      return this.currentUser ? this.currentUser.emp_id : null;
    },
    employeeList(){
      return this.$store.state.emp_review_feedback.employeeList;
    }
  },
  methods: {
    fetchEmployees(){
      console.log("#### going to try and fetch all entities on this route now: ", this.routeName);
      this.$store.dispatch(`emp_review_feedback/getAllEmployees`)
    },
    gotoPage(pagePath){
      this.$router.push({path: pagePath});
    },
    switchCurrentUser(val){
      console.log("### this is the changed user: ", val);
      if(!val)
        this.$store.commit('emp_review_feedback/updateCurrentEmployee', null);
      else
        this.$store.commit('emp_review_feedback/updateCurrentEmployee', this.employeeList.find(x => x.emp_id = val));
    }
    // checkUserAuthStatus(){
    //   console.log("### THIS IS THE CURRENT USER: ", this.currentUser);
    //   if(!this.authenticated){
    //     console.log("### User not authenticated, redirecting to login page!");
    //     setTimeout(() => {
    //       this.gotoPage('/login');
    //     }, 400);
    //   }
    //   else{
    //     console.log("### User authenticated: ", this.currentUser);
    //     this.gotoPage('/');
    //   }
    // },
    // logoutUser(){
    //   this.$store.dispatch(`emp_review_feedback/logoutUser`);
    //   setTimeout(() => {
    //     this.gotoPage('/login');
    //   }, 400);
    // }
  }
}
</script>
