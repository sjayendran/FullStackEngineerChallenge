<template>
  <div>
    <v-toolbar flat color="white">
      <v-toolbar-title class="capitalize">{{routeName}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="appSearch"
        append-icon="mdi-feature-search"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
      <v-btn
        color="primary"
        class="ma-2 white--text btnAddNewReview"
        :href="`/`+routeName+`/new`"
      >
        <v-icon left>mdi-file-document-box-plus</v-icon>
        New Performance Review
      </v-btn>
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
      <v-dialog v-model="view_dialog" click:outside="close(true)" max-width="800">
        <v-card>
          <v-card-title>
            <h4 v-if="edit_mode">
              Edit Performance Review
            </h4>
            <h4 v-else>
              View Performance Review
            </h4>
          </v-card-title>
          <v-card-text>
            <v-container fluid>
              <v-row>
                <v-col
                  cols="12"
                  md="4"
                >
                  <v-text-field disabled v-model="editedItem._id" label="Review ID"></v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  md="4"
                >
                  <v-text-field disabled v-model="editedItem.emp_id" label="For Employee"></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12"
                  md="8">
                  <v-text-field v-if="!edit_mode" disabled v-model="editedItem.feedback_emp_list" label="Feedback from Employees"></v-text-field>
                  <v-combobox
                    v-else
                    v-model="editedFeedbackEmployeeList"
                    :items="feedbackEmplList"
                    item-value="emp_id"
                    label="Feedback from Employees (not including review employee)"
                    multiple
                    chips
                  >
                      <template v-slot:item="{ item, index }">
                          <span>{{ item.first_name }} {{ item.last_name }} ({{item.emp_id}}) [{{item.designation}} @ {{item.department}}]</span>
                      </template>
                      <template v-slot:selection="data">
                      <v-chip
                        :key="JSON.stringify(data.item)"
                        v-bind="data.attrs"
                        :input-value="data.selected"
                        :disabled="data.disabled"
                        @click:close="data.parent.selectItem(data.item)"
                      >
                      <span class="pr-2">
                          {{ data.item.first_name }} {{ data.item.last_name }} [{{ data.item.emp_id }}]
                      </span>
                      <v-icon
                          small
                          @click="data.parent.selectItem(data.item)"
                      >mdi-close</v-icon>
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-col>
              </v-row>
              <v-row>
                <v-col
                  cols="12"
                  md="8"
                >
                  <v-textarea :disabled="!edit_mode" v-model="editedItem.writeup" label="Writeup"></v-textarea>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" @click="view_dialog=false">{{edit_mode ? 'Cancel' : 'Close'}}</v-btn>
            <v-btn v-if="!edit_mode" color="primary" @click="switchToEditMode">Edit</v-btn>
            <v-btn v-else color="success" @click="updateAppEntity">Save</v-btn>
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
        <v-icon
          small
          class="mr-2"
          @click="editEntity(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          small
          class="mr-2"
          @click="viewEntity(item)"
        >
          mdi-eye
        </v-icon>
        <v-icon
          small
          @click="deleteEntity(item)"
        >
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  export default {
    data: () => ({
      dialog: false,
      entity_type: "Review",
      edit_mode: false,
      view_dialog: false,
      headers: [
        {
          text: 'ID',
          align: 'left',
          sortable: true,
          filterable: true,
          value: '_id'
        },
        { text: 'Review Year', value: 'review_year', sortable: true, filterable: true  },
        { text: 'Write-up', value: 'writeup', sortable: false, filterable: true,  },
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
      eventStatus: ['Defined','In Development','QA','Production'],
      formValid: false,
      appSnackbar: false,
      appSnackbarColor: null,
      appSnackbarMsg: null,
      inlineEditedEventStatus: null,
      inlineEditedEventID: null
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
      }
    },
    filters: {
      truncateWriteup: function(value){
        return value.slice(0, 40) + "...";
      },
    },
    methods: {
      switchToEditMode(){
        this.edit_mode = true;
      },
      editInlineEventStatus(newStatus, eventID){
        console.log("#### new status is: ", newStatus, eventID);
        this.inlineEditedEventStatus = newStatus;
        this.inlineEditedEventID = eventID;
      },
      openInlineEditing(currentState){
        this.inlineEditedEventStatus = currentState.status;
        this.inlineEditedEventID = currentState.id;
      },
      updateEventStatus(){
        console.log("###### status updated: ", this.inlineEditedEventStatus);
        let editedItem = {
          id: this.inlineEditedEventID,
          status: this.inlineEditedEventStatus
        }
        this.$store.dispatch(`${this.routeName}/updateEventStatus`, {editedItem}).then(updated => {
          if(updated){
            this.showSnackBar(`Successfully updated ${this.entity_type}`, "green");
          }
          else{
            this.showSnackBar(`ERROR while trying to update ${this.entity_type}!`, "error");
          }
        });
      },
      updateExistingEntity(){
        let editedItem = Object.assign({}, this.editedItem);
        editedItem.feedback_emp_list = this.editedFeedbackEmployeeList.map(y => y.emp_id).toString();
        console.log("##### this is the edited item: ", editedItem);
        this.$store.dispatch(`emp_review_feedback/updateReview`, {editedItem}).then(updated => {
          if(updated){
            this.showSnackBar(`Successfully updated ${this.entity_type}`, "green");
            this.view_dialog = false;
          }
          else{
            this.showSnackBar(`ERROR while trying to update ${this.entity_type}!`, "error");
          }
        });
      },
      showSnackBar(msg, color){
          this.appSnackbarMsg = msg;
          this.appSnackbar = true;
          this.appSnackbarColor = color;
      },
      editEntity (appObj){
        this.viewEntity(appObj);
        this.switchToEditMode();
      },
      viewEntity (appObj) {
        this.editedIndex = this.reviewList.indexOf(appObj)
        this.editedItem = Object.assign({}, appObj)
        this.editedFeedbackEmployeeList = this.editedItem.feedback_emp_list.split(',').map(x => this.employeeList.find(y => y.emp_id == x));
        this.view_dialog = true;
        this.edit_mode = false;
        console.log("######## this is the ITEM BEING VIEWED NOW: ", this.editedItem, this.editedFeedbackEmployeeList);
      },
      fetchEntities(){
        console.log("#### going to try and fetch all reviews on this route now: ", this.routeName);
        this.$store.dispatch(`emp_review_feedback/getAllReviews`)
      },
      fetchEmployees(){
        this.$store.dispatch(`emp_review_feedback/getAllEmployees`);
      },
      nameForEmployeeID(emplid){
        let match = this.employeeList.find(x => x.emp_id == emplid);
        return !match ? "" : match.first_name + " " + match.last_name + ` (${match.emp_id})`;
      },
      deleteEntity (appObj) {
        if(confirm(`Are you sure you want to delete this ${this.entity_type}?`)){
          this.$store.dispatch(`emp_review_feedback/deleteReview`, {appObj}).then(deleted => {
            if(deleted){
                this.showSnackBar(`Successfully deleted ${this.entity_type}:  ${appObj._id}`, "info");
            }
            else{
                this.showSnackBar("ERROR while trying to delete page", "error");
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