<template>
<v-layout row wrap>
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
    <v-snackbar
      v-model="appSnackbar"
      :color="appSnackColor"
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
    <v-flex xs12 md6> 
    <v-form
        class="ma-5"
        ref="form"
        v-model="formValid"
        lazy-validation
    >
        <h2>Add New Employee</h2>
        <v-text-field
        v-model="emp_id"
        :rules="[rules.required]"
        label="Employee ID"
        required
        ></v-text-field>
        <v-text-field
        v-model="emp_first_name"
        :counter="40"
        :rules="[rules.required]"
        label="First Name"
        required
        ></v-text-field>
        <v-text-field
        v-model="emp_last_name"
        :counter="40"
        :rules="[rules.required]"
        label="Last Name"
        required
        ></v-text-field>
        <v-text-field
        v-model="emp_department"
        :rules="[rules.required]"
        label="Department"
        required
        ></v-text-field>
        <v-text-field
        v-model="emp_designation"
        :rules="[rules.required]"
        label="Designation"
        required
        ></v-text-field>
        <!-- <v-checkbox label="Admin" class="mx-2" v-model="emp_admin"></v-checkbox> -->
        <v-btn
        color="green"
        class="white--text"
        :disabled="!formValid"
        @click="addNewEmployee"
        >
        Add Employee
        </v-btn>

        <v-btn
        color="error"
        @click="reset"
        >
        Reset
        </v-btn>
    </v-form>
    </v-flex>
</v-layout>
</template>

<script>
    export default {
        data: () => ({
            appSnackbar: false,
            appSnackColor: null,
            appSnackbarMsg: null,
            formValid: false,
            emp_id: null,
            emp_first_name: null,
            emp_last_name: null,
            emp_department: null,
            emp_designation: null,
            emp_admin: false,
            rules: {
                required: value => !!value || 'Field is required'
            },
        }),
        computed: {
            appBusy(){
                return this.$store.state.emp_review_feedback.loading;
            },
            busyMsg(){
                return this.$store.state.emp_review_feedback.loadingMsg;
            },
            errorMsg(){
                return this.$store.state.emp_review_feedback.errorMsg;
            }
        },
        methods: {
            showSnackBar(msg, color){
                this.appSnackbarMsg = msg;
                this.appSnackbar = true;
                this.appSnackColor = color;
            },
            delayAndGotoPage(pagePath){
                let self = this;
                setTimeout(function(){
                    self.$router.push({path: pagePath});
                }, 1000);
            },
            addNewEmployee(){
                // if(this.emp_id && this.emp_first_name && this.emp_department && this.emp_designation)
                // {
                    let appObj = {
                        emp_id: this.emp_id,
                        first_name: this.emp_first_name,
                        last_name: this.emp_last_name,
                        department: this.emp_department,
                        designation: this.emp_designation,
                        admin: this.emp_admin ? 1 : 0
                    }
                    this.$store.dispatch('emp_review_feedback/createEmployee', {appObj}).then(created => {
                        if(created){
                            this.showSnackBar(`Successfully created new employee!`, "green");
                            this.delayAndGotoPage('/employee');
                        }
                        else{
                            this.showSnackBar(`ERROR while trying to create new employee: ${this.errorMsg}`, "error");
                        }
                    });
                // }
                // else{
                //     this.showSnackBar(`Please fill up all employee details!`, "error");
                // }
            },
            reset () {
                this.$refs.form.reset()
            },
            resetValidation () {
                this.$refs.form.resetValidation()
            }
        }
    }
</script>