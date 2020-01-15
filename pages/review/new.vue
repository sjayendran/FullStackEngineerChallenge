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
        <h2>Add New Performance Review</h2>
        <v-select
            :items="employeeList"
            :rules="[rules.required]"
            item-value="emp_id"
            clearable
            v-model="selected_emp_id"
            label="For Employee"
        >
            <template v-slot:item="{ item, index }">
                <span>{{ item.first_name }} {{ item.last_name }} ({{item.emp_id}}) [{{item.designation}} @ {{item.department}}]</span>
            </template>
            <template v-slot:selection="{ item, index }">
                <span>{{ item.first_name }} {{ item.last_name }} ({{item.emp_id}}) [{{item.designation}} @ {{item.department}}]</span>
            </template>
        </v-select>
        <v-select
            :items="reviewYearList"
            :rules="[rules.required]"
            clearable
            v-model="selected_review_year"
            label="Review Year"
        >
        </v-select>
        <v-textarea
          outlined
          v-model="review_writeup"
          label="Writeup"
          counter
          placeholder="Write your performance review here..."
          name="review_writeup"
        ></v-textarea>
        <v-combobox
          v-model="selected_feedback_employees"
          :items="feedbackEmplList"
          item-value="emp_id"
          label="Feedback from these Employees (not including review employee)"
          multiple
          chips
          name="feedbackEmplList"
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
        <v-btn
        color="green"
        class="white--text btnAddNewReview"
        :disabled="!formValid"
        @click="addNewReview"
        >
        Add Review
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
            selected_emp_id: null,
            selected_review_year: null,
            review_writeup: "",
            selected_feedback_employees: [],
            rules: {
                required: value => !!value || 'Field is required'
            },
        }),
        mounted(){
            this.fetchEmployees();
        },
        computed: {
            reviewYearList(){
                let yearList = [];
                yearList.push(new Date().getFullYear() - 1);
                yearList.push(new Date().getFullYear());
                yearList.push(new Date().getFullYear() + 1);
                return yearList;
            },
            appBusy(){
                return this.$store.state.emp_review_feedback.loading;
            },
            busyMsg(){
                return this.$store.state.emp_review_feedback.loadingMsg;
            },
            errorMsg(){
                return this.$store.state.emp_review_feedback.errorMsg;
            },
            employeeList () {
                return this.$store.state.emp_review_feedback.employeeList;
            },
            feedbackEmplList(){
                return !this.selected_emp_id ? this.$store.state.emp_review_feedback.employeeList : this.$store.state.emp_review_feedback.employeeList.filter(x => x.emp_id !== this.selected_emp_id);
            }
        },
        methods: {
            fetchEmployees(){
                this.$store.dispatch(`emp_review_feedback/getAllEmployees`)
            },
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
            addNewReview(){
                // if(this.emp_id && this.emp_first_name && this.emp_department && this.emp_designation)
                // {
                    let appObj = {
                        emp_id: this.selected_emp_id,
                        writeup: this.review_writeup,
                        review_year: this.selected_review_year,
                        feedback_emp_list: this.selected_feedback_employees.map(y => y.emp_id).toString()
                    }
                    this.$store.dispatch('emp_review_feedback/createReview', {appObj}).then(created => {
                        if(created){
                            this.showSnackBar(`Successfully created new review!`, "green");
                            this.delayAndGotoPage('/review');
                        }
                        else{
                            this.showSnackBar(`ERROR while trying to create new review: ${this.errorMsg}`, "error");
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