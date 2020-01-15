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
        class="ma-2 white--text"
        :href="`/`+routeName+`/new`"
      >
        <v-icon left>mdi-account-plus</v-icon>
        New Employee
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
      <v-dialog v-model="dialog" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">Edit Employee</span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-row>
                <v-col
                  cols="12"
                  md="4"
                >
                  <v-text-field disabled v-model="editedItem.emp_id" label="Employee ID"></v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  md="4"
                >
                  <v-text-field v-model="editedItem.first_name" label="First Name"></v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  md="4"
                >
                  <v-text-field v-model="editedItem.last_name" label="Last Name"></v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field v-model="editedItem.department" label="Department"></v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-text-field v-model="editedItem.designation" label="Designation"></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" @click="dialog=false">Cancel</v-btn>
            <v-btn color="primary" @click="updateAppEntity">Save</v-btn>
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
      :items="employeeList"
      :loading="appBusy"
      :search="appSearch"
      :items-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
      item-key="emp_id"
      class="elevation-1"
    >
      <!-- <template v-slot:item.admin="props">
        <v-edit-dialog
          :return-value="props.item.admin"
          large
          @save="updateAdminStatus()"
          @open="openInlineEditingForAdminStatus(props.item)"
          @cancel="cancel"
          @close="close"
        > 
            <v-icon
              :color="(props.item && props.item.admin == 1) ? 'green' : 'grey'"
              class="mx-2"
            >
              mdi-check-circle
            </v-icon>
          <template v-slot:input>
            <v-checkbox
              :value="props.item.admin == 1 ? 'true' : 'false'"
              label="Update Admin Status"
              @change="editInlineAdminStatus($event, props.item.emp_id)"
            ></v-checkbox>
          </template>
        </v-edit-dialog>
      </template> -->
      <template v-slot:item.actions="{ item }">
        <v-icon
          small
          class="mr-2"
          @click="editEntity(item)"
        >
          mdi-account-edit
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
      headers: [
        {
          text: 'ID',
          align: 'left',
          sortable: true,
          filterable: true,
          value: 'emp_id'
        },
        { text: 'First Name', value: 'first_name', sortable: true, filterable: true  },
        { text: 'Last Name', value: 'last_name', sortable: false, filterable: true,  },
        { text: 'Department', value: 'department', sortable: true, filterable: true,  },
        { text: 'Designation', value: 'designation', sortable: false, filterable: true, },
        // { text: 'Admin', value: 'admin', sortable: false, filterable: true, },
        { text: 'Actions', value: 'actions', sortable: false, filterable: true, }
      ],
      rules: {
        noSpacesAllowed: value => (!!value && !value.includes(' ')) || "Key cannot contain spaces, but must use underscores",
        required: value => !!value || 'Field is required',
        counter: value => value.length <= 20 || 'Max 20 characters',
        email: value => {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return pattern.test(value) || 'Invalid e-mail.'
        }
      },
      appSearch: '',
      appBeingEdited: null,
      appImageFile: null,
      editedItem: {
      },
      editedImage: null,
      pagination: {
          page: 1,
          rowsPerPage: 10,
          totalItems: 100,
          sortBy: 'name',
          descending: true
        },
      rowsPerPageItems: [10, 20, 30, 40],
      formValid: false,
      appSnackbar: false,
      appSnackbarColor: null,
      appSnackbarMsg: null,
      inlineEditedEmployeeAdminStatus: null,
      inlineEditedEmployeeID: null
    }),
    watch: {
      dialog (val) {
        val || this.close()
      }
    },
    mounted(){
      this.fetchEntities();
    },
    computed: {
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
      currentUser(){
        return this.$store.state.emp_review_feedback.currentlyAuthenticatedEmployee;
      }
    },
    methods: {
      editInlineAdminStatus(newStatus, emplID){
        console.log("#### new status is: ", newStatus, emplID);
        this.inlineEditedEmployeeAdminStatus = newStatus == null ? 0 : 1;
        this.inlineEditedEmployeeID = emplID;
      },
      openInlineEditingForAdminStatus(currentState){
        console.log("### opened for inline updating: ", currentState.admin);
        this.inlineEditedEmployeeAdminStatus = currentState.admin == 1 ? 'true' : null;
        this.inlineEditedEmployeeID = currentState.id;
      },
      updateAdminStatus(){
        console.log("###### status updated: ", this.inlineEditedEmployeeAdminStatus);
        let editedItem = {
          emp_id: this.inlineEditedEmployeeID,
          admin: this.inlineEditedEmployeeAdminStatus
        }
        this.$store.dispatch(`emp_review_feedback/updateAdminStatus`, {editedItem}).then(updated => {
          if(updated){
            this.showSnackBar(`Successfully updated employee!`, "green");
          }
          else{
            this.showSnackBar(`ERROR while trying to update employee!`, "error");
          }
        });
      },
      updateExistingEntity(){
        let editedItem = this.editedItem;
        this.$store.dispatch(`emp_review_feedback/updateEmployee`, {editedItem}).then(updated => {
          if(updated){
            this.showSnackBar(`Successfully updated employee!`, "green");
            this.dialog = false;
          }
          else{
            this.showSnackBar(`ERROR while trying to update ${this.entity_type}!`, "error");
          }
        });;
      },
      showSnackBar(msg, color){
          this.appSnackbarMsg = msg;
          this.appSnackbar = true;
          this.appSnackbarColor = color;
      },
      editEntity (appObj) {
        this.editedItem = Object.assign({}, appObj)
        this.dialog = true;
      },
      fetchEntities(){
        this.$store.dispatch(`emp_review_feedback/getAllEmployees`)
      },
      deleteEntity (appObj) {
        if(confirm(`Are you sure you want to delete this employee?`)){
          this.$store.dispatch(`emp_review_feedback/deleteEmployee`, {appObj}).then(deleted => {
            if(deleted){
              this.showSnackBar(`Successfully deleted employee:  ${appObj.emp_id}`, "info");
            }
            else{
              this.showSnackBar("ERROR while trying to delete employee", "error");
            }
          });   
        }
      },
      cancel () {
        this.inlineEditedEmployeeAdminStatus = undefined;
        this.inlineEditedEmployeeID = null;
      },
      close () {
        this.cancel();
      },
      updateAppEntity(){
        this.updateExistingEntity();
        this.close(false)
      }
    }
  }
</script>
