<template>
  <div>
    <v-toolbar flat color="white">
      <v-toolbar-title class="capitalize">Performance Reviews requiring your Feedback</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-select
        :items="employeeList"
        clearable
        item-value="emp_id"
        v-model="selected_employee"
        label="Feedback required by Employee"
        class="mt-5"
        @change="fetchEntities"
      >
        <template v-slot:item="{ item, index }">
          <span>{{ item.first_name }} {{ item.last_name }} ({{item.emp_id}}) [{{item.designation}} @ {{item.department}}]</span>
        </template>
        <template v-slot:selection="{ item, index }">
          <span>{{ item.first_name }} {{ item.last_name }} ({{item.emp_id}}) [{{item.designation}} @ {{item.department}}]</span>
        </template>
      </v-select>
      <v-dialog
          v-model="appBusy"
          persistent
          width="300"
      >
          <v-card
          color="primary"
          dark
          >
          <v-card-text>
              {{busyMsg}}
              <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
              ></v-progress-linear>
          </v-card-text>
          </v-card>
      </v-dialog>
      <v-dialog v-model="view_dialog" click:outside="close(true)" max-width="500">
        <v-card>
          <v-card-title>
            <h4 v-if="dialog_mode == 'create'">
              Submit Feedback as {{nameForEmployeeID(selected_employee)}}
            </h4>
            <h4 v-else-if="dialog_mode == 'edit'">
              Edit your Feedback
            </h4>
          </v-card-title>
          <v-card-text>
            <v-container fluid>
              <v-form
                  class="ma-5"
                  ref="form"
                  v-model="formValid"
                  lazy-validation
                  v-if="dialog_mode == 'create'"
              >
                <v-text-field
                :value="nameForEmployeeID(editedItem.emp_id)"
                label="Feedback for"
                disabled
                ></v-text-field>
                <h5>Performance Review Submitted: </h5>
                <div><i>{{editedItem.writeup}}</i></div>
                <v-textarea
                v-model="feedback_writeup"
                :rules="[rules.required]"
                label="Your Feedback"
                required
                ></v-textarea>
              </v-form>
              <v-form
                  class="ma-5"
                  ref="form"
                  v-model="formValid"
                  lazy-validation
                  v-if="dialog_mode == 'edit'"
              >
                <v-text-field
                :value="nameForEmployeeID(editedItem.emp_id)"
                label="Feedback for"
                disabled
                ></v-text-field>
                <h5>Performance Review Submitted: </h5>
                <div><i>{{editedItem.writeup}}</i></div>
                <v-textarea
                v-model="feedback_writeup"
                :rules="[rules.required]"
                label="Your Feedback"
                required
                ></v-textarea>
              </v-form>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" @click="view_dialog=false">{{dialog_mode ? 'Cancel' : 'Close'}}</v-btn>
            <v-btn v-if="dialog_mode == 'edit'" color="primary" @click="updateAppEntity">Save</v-btn>
            <v-btn v-else-if="dialog_mode == 'create'" color="success" @click="submitFeedback">Submit Feedback</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>
    <v-snackbar
      v-model="appSnackbar"
      :color="appSnackbarColor"
      :timeout="4000"
    >
      {{ appSnackbarMsg }}
      <v-btn
        text
        @click="appSnackbar = false"
      >
        Close
      </v-btn>
    </v-snackbar>
    <v-data-table
      :headers="headers"
      :items="reviewList"
      :loading="appBusy"
      :search="appSearch"
      :items-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
      no-data-text="No feedback currently required from this employee"
      item-key="_id"
      class="elevation-1"
    >
    
      <template v-slot:item.writeup="{ item }">
        <span>{{item.writeup | truncateWriteup}}</span>
      </template>
      <template v-slot:item.emp_id="{ item }">
        <span>{{nameForEmployeeID(item.emp_id)}}</span>
      </template>
      <template v-slot:item.feedback_emp_list="{ item }">
        <v-chip
          v-for="emp_id in item.feedback_emp_list.split(',')"
          :key="emp_id"
          class="ma-1"
        >
          {{nameForEmployeeID(emp_id)}}
        </v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <div v-if="!feedbackAlreadySubmitted(item._id)">
          <v-btn small color="success" :disabled="!selected_employee" @click="provideFeedback(item)">{{ selected_employee ? 'Submit Feedback' : 'Select Employee Above First'}}</v-btn>
        </div>
        <div v-else>
          <v-btn small color="info" :disabled="!selected_employee" @click="editEntity(item)">Edit Feedback</v-btn>
          <v-btn small color="error" :disabled="!selected_employee" @click="deleteEntity(item)">Delete Feedback</v-btn>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  export default {
    data: () => ({
      dialog: false,
      entity_type: "Feedback",
      dialog_mode: "",
      view_dialog: false,
      selected_employee: null,
      headers: [
        {
          text: 'ID',
          align: 'left',
          sortable: true,
          filterable: true,
          value: '_id'
        },
        { text: 'Review Year', value: 'review_year', sortable: true, filterable: true  },
        { text: 'For Employee', value: 'emp_id', sortable: true, filterable: true,  },
        { text: 'Feedback required from Employees', value: 'feedback_emp_list', sortable: false, filterable: true, },
        { text: 'Actions', value: 'actions', sortable: false, filterable: true, }
      ],
      rules: {
        required: value => !!value || 'Field is required',
      },
      appSearch: '',
      editedIndex: -1,
      editedFeedbackEmployeeList: [],
      editedItem: {},
      pagination: {
          page: 1,
          rowsPerPage: 10,
          totalItems: 100,
          sortBy: 'name',
          descending: true
        },
      rowsPerPageItems: [10, 20, 30, 40],
      selectedFeedbackObj: null,
      feedback_writeup: "",
      formValid: false,
      appSnackbar: false,
      appSnackbarColor: null,
      appSnackbarMsg: null
    }),
    watch: {
      dialog (val) {
        val || this.close()
      }
    },
    mounted(){
      this.fetchEntities();
      this.fetchEmployees();
    },
    computed: {
      reviewList () {
        return this.$store.state.emp_review_feedback.reviewList;
      },
      employeeList () {
        return this.$store.state.emp_review_feedback.employeeList;
      },
      feedbackList () {
        return this.$store.state.emp_review_feedback.feedbackList;
      },
      appBusy(){
        return this.$store.state.emp_review_feedback.loading;
      },
      busyMsg(){
        return this.$store.state.emp_review_feedback.loadingMsg;
      },
      routeName(){
        return this.$router.currentRoute.name;
      },
      feedbackEmplList(){
        return !this.editedItem.emp_id ? this.$store.state.emp_review_feedback.employeeList : this.$store.state.emp_review_feedback.employeeList.filter(x => x.emp_id !== this.editedItem.emp_id);
      },
    },
    filters: {
      truncateWriteup: function(value){
        return value.slice(0, 40) + "...";
      },
    },
    methods: {
      feedbackAlreadySubmitted(review_id){
        return this.feedbackList.filter(x => x.review_id == review_id && x.author_emp_id == this.selected_employee).length > 0;
      },
      updateExistingEntity(){
        let editedItem = {
          id: this.selectedFeedbackObj._id,
          author_emp_id: this.selected_employee,
          review_id: this.editedItem._id,
          writeup: this.feedback_writeup,
        }
        this.$store.dispatch(`emp_review_feedback/updateFeedback`, {editedItem}).then(updated => {
          if(updated){
            this.showSnackBar(`Successfully updated ${this.entity_type}`, "green");
            this.view_dialog = false;
            this.fetchFeedbackBySpecificEmployee();
          }
          else{
            this.showSnackBar(`ERROR while trying to update ${this.entity_type}!`, "error");
          }
        });
      },
      submitFeedback(){
        let appObj = {
          author_emp_id: this.selected_employee,
          review_id: this.editedItem._id,
          writeup: this.feedback_writeup,
        }
        this.$store.dispatch('emp_review_feedback/submitFeedback', {appObj}).then(created => {
          if(created){
              this.showSnackBar(`Successfully submitted feedback!`, "green");
              this.view_dialog = false;
              this.fetchEntities();
          }
          else{
              this.showSnackBar(`ERROR while trying to submit feedback: ${this.errorMsg}`, "error");
          }
        });
      },
      showSnackBar(msg, color){
          this.appSnackbarMsg = msg;
          this.appSnackbar = true;
          this.appSnackbarColor = color;
      },
      editEntity (appObj) {
        this.editedIndex = this.reviewList.indexOf(appObj)
        this.editedItem = Object.assign({}, appObj)
        this.selectedFeedbackObj = Object.assign({}, this.feedbackList.filter(x => x.review_id == this.editedItem._id && x.author_emp_id == this.selected_employee)[0]);
        this.feedback_writeup = this.selectedFeedbackObj.writeup;
        this.view_dialog = true;
        this.dialog_mode = "edit";
      },
      provideFeedback (appObj) {
        this.editedIndex = this.reviewList.indexOf(appObj)
        this.editedItem = Object.assign({}, appObj)
        this.feedback_writeup = "";
        this.view_dialog = true;
        this.dialog_mode = "create";
        console.log("######## this is the ITEM BEING VIEWED NOW: ", this.editedItem, this.editedFeedbackEmployeeList);
      },
      fetchFeedbackBySpecificEmployee(){
        this.$store.dispatch(`emp_review_feedback/getFeedbackSubmittedByEmployee`, {selected_user: this.selected_employee});
      },
      fetchEntities(){
        this.$store.dispatch(`emp_review_feedback/getReviewsForFeedbackBySelectedUser`, {selected_user: this.selected_employee});
        if(this.selected_employee){
          this.fetchFeedbackBySpecificEmployee();
        }
      },
      fetchEmployees(){
        this.$store.dispatch(`emp_review_feedback/getAllEmployees`);
      },
      nameForEmployeeID(emplid){
        let match = this.employeeList.find(x => x.emp_id == emplid);
        return !match ? "" : match.first_name + " " + match.last_name + ` (${match.emp_id})`;
      },
      deleteEntity (reviewObj) {
        if(confirm(`Are you sure you want to delete this ${this.entity_type}?`)){
          let appObj = Object.assign({}, this.feedbackList.filter(x => x.review_id == reviewObj._id && x.author_emp_id == this.selected_employee)[0]);
          this.$store.dispatch(`emp_review_feedback/deleteFeedback`, {appObj}).then(deleted => {
            if(deleted){
                this.showSnackBar(`Successfully deleted ${this.entity_type}:  ${appObj._id}`, "info");
                this.fetchFeedbackBySpecificEmployee();
            }
            else{
                this.showSnackBar("ERROR while trying to delete feedback", "error");
            }
          });   
        }
      },
      close(cancelling) {
        this.view_dialog = false
        setTimeout(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        }, 300)
      },

      updateAppEntity(){
        this.updateExistingEntity();
        this.close(false)
      },
    }
  }
</script>