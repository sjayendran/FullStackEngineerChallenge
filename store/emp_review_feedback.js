const baseAPIURL = "http://localhost:3000/api/"
export const state = () => ({
    employeeList: [],
    reviewList: [],
    feedbackList: [],
    currentlyAuthenticatedEmployee: {},
    currentEmployee: {},
    loading: false,
    loadingMsg: "",
    errorMsg: "",
})

export const mutations = {
    updateFeedbackList(state, newList){
        state.feedbackList = newList;
    },
    updateReviewList(state, newList){
        state.reviewList = newList;
    },
    updateEmployeeList(state, newList){
        state.employeeList = newList;
    },
    updateCurrentlyAuthenticatedEmployee(state, newEmplObj){
        if(newEmplObj && newEmplObj.emp_id)
            newEmplObj.authenticated = true;
        state.currentlyAuthenticatedEmployee = newEmplObj;
    },
    updateCurrentEmployee(state, newEmplObj){
        state.currentEmployee = newEmplObj;
    },
    startLoading (state){
        state.loading = true;
    },
    finishLoading (state){
        state.loading = false;
    },
    updateLoadingMsg(state, msg){
        state.loadingMsg = msg;
    },
    updateErrorMsg(state, msg){
        state.errorMsg = msg;
    }
}

export const actions = {
    deleteFeedback(context, args){
        const entity = "feedback";
        context.commit('startLoading');
        context.commit('updateLoadingMsg', `Deleting feedback...`);

        return this.$axios.$delete(baseAPIURL+entity, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            data: {
                id: args.appObj._id
            }
        })
        .then(function (response) {
            context.commit('finishLoading');
            return true;
        })
        .catch(function (error) {
            console.log('Encountered an error while trying to delete review: ', error);
            context.commit('finishLoading');
            return false;
        });
    },
    updateFeedback(context, args){
        const entity = "feedback";
        context.commit('startLoading');
        context.commit('updateLoadingMsg', `Updating ${entity}...`);

        return this.$axios.$patch(baseAPIURL+entity, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            author_emp_id: args.editedItem.author_emp_id,
            review_id: args.editedItem.review_id,
            writeup: args.editedItem.writeup,
            id: args.editedItem.id
        })
        .then(function (response) {
            context.commit('finishLoading');
            return true;
        })
        .catch(function (error) {
            console.log('Encountered an error while trying to update employee: ', error.response.data.message);
            context.commit('finishLoading');
            return false;
        });
    },
    getFeedbackSubmittedByEmployee(context, args){
        const entity = "feedback";
        context.commit('startLoading');
        context.commit('updateLoadingMsg', `Fetching specific feedback...`);
        
        if(args.selected_user){
            this.$axios.$get(baseAPIURL+entity+`/${args.selected_user}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
            .then(function (response) {
                console.log(`got back this response for ${entity}s: ${JSON.stringify(response)}`);
                context.commit('updateFeedbackList', response.result);
                context.commit('finishLoading');
            })
            .catch(function (error) {
                console.log(`Encountered an error while trying to fetch ${entity}s: ${error}`);
                context.commit('updateFeedbackList', []);
                context.commit('finishLoading');
            });
        }
    },
    submitFeedback(context, args){
        const entity = "feedback";
        context.commit('startLoading');
        context.commit('updateLoadingMsg', `Submitting Feedback...`);
        return this.$axios.$post(baseAPIURL+entity, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            author_emp_id: args.appObj.author_emp_id,
            review_id: args.appObj.review_id,
            writeup: args.appObj.writeup
        })
        .then(function (response) {
            context.commit('finishLoading');
            return true;
        })
        .catch(function (error) {
            console.log('Encountered an error while trying to submit feedback: ', error);
            context.commit('finishLoading');
            context.commit('updateErrorMsg', error.response.data);
            return false;
        });
    },
    getReviewsForFeedbackBySelectedUser(context, args){
        const entity = "review";
        context.commit('startLoading');
        context.commit('updateLoadingMsg', `Fetching specific reviews...`);
        
        console.log(`fetching all reviews from this URL: ${baseAPIURL+entity}`, args);
        if(!args.selected_user){
            context.dispatch('getAllReviews');
        }
        else{
            this.$axios.$get(baseAPIURL+entity+`/${args.selected_user}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
            .then(function (response) {
                context.commit('updateReviewList', response.result);
                context.commit('finishLoading');
            })
            .catch(function (error) {
                console.log(`Encountered an error while trying to fetch ${entity}s: ${error}`);
                context.commit('updateReviewList', []);
                context.commit('finishLoading');
            });
        }
    },
    updateReview(context, args){
        const entity = "review";
        context.commit('startLoading');
        context.commit('updateLoadingMsg', `Updating ${entity}...`);

        return this.$axios.$patch(baseAPIURL+entity, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            id: args.editedItem._id,
            writeup: args.editedItem.writeup,
            feedback_emp_list: args.editedItem.feedback_emp_list
        })
        .then(function (response) {
            context.commit('finishLoading');
            context.dispatch('getAllReviews');
            return true;
        })
        .catch(function (error) {
            console.log('Encountered an error while trying to update employee: ', error.response.data.message);
            context.commit('finishLoading');
            return false;
        });
    },
    createReview(context, args){
        const entity = "review";
        context.commit('startLoading');
        context.commit('updateLoadingMsg', `Creating Review...`);
        return this.$axios.$post(baseAPIURL+entity, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            emp_id: args.appObj.emp_id,
            writeup: args.appObj.writeup,
            review_year: args.appObj.review_year,
            feedback_emp_list: args.appObj.feedback_emp_list
        })
        .then(function (response) {
            context.commit('finishLoading');
            return true;
        })
        .catch(function (error) {
            console.log('Encountered an error while trying to create new employee: ', error);
            context.commit('finishLoading');
            context.commit('updateErrorMsg', error.response.data);
            return false;
        });
    },
    deleteReview(context, args){
        const entity = "review";
        context.commit('startLoading');
        context.commit('updateLoadingMsg', `Deleting review...`);

        return this.$axios.$delete(baseAPIURL+entity, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            data: {
                id: args.appObj._id
            }
        })
        .then(function (response) {
            context.commit('finishLoading');
            context.dispatch('getAllReviews');
            return true;
        })
        .catch(function (error) {
            console.log('Encountered an error while trying to delete review: ', error);
            context.commit('finishLoading');
            context.dispatch('getAllReviews');
            return false;
        });
    },
    getAllReviews (context){
        const entity = "review";
        context.commit('startLoading');
        context.commit('updateLoadingMsg', `Fetching reviews...`);
        
        console.log(`fetching all reviews from this URL: ${baseAPIURL+entity}`);
        this.$axios.$get(baseAPIURL+entity, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
        .then(function (response) {
            console.log(`got back this response for ${entity}s: ${JSON.stringify(response)}`);
            context.commit('updateReviewList', response.result);
            context.commit('finishLoading');
        })
        .catch(function (error) {
            console.log(`Encountered an error while trying to fetch ${entity}s: ${error}`);
            context.commit('updateReviewList', []);
            context.commit('finishLoading');
        });
    },
    getAllEmployees (context) {
        const entity = "employee";
        context.commit('startLoading');
        context.commit('updateLoadingMsg', `Fetching employees...`);
        
        this.$axios.$get(baseAPIURL+entity, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
        .then(function (response) {
            context.commit('updateEmployeeList', response.result);
            if(!context.state.currentEmployee){
                context.commit('updateCurrentEmployee', response.result[0]);
            }
            context.commit('finishLoading');
        })
        .catch(function (error) {
            console.log(`Encountered an error while trying to fetch ${entity}s: ${error}`);
            context.commit('updateEmployeeList', []);
            context.commit('finishLoading');
        });
    },
    createEmployee(context, args){
        const entity = "employee";
        console.log("#### reached employee creation with these args: ", args);
        context.commit('startLoading');
        context.commit('updateLoadingMsg', `Creating Employee...`);
        return this.$axios.$post(baseAPIURL+entity, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            emp_id: args.appObj.emp_id,
            first_name: args.appObj.first_name,
            last_name: args.appObj.last_name,
            department: args.appObj.department,
            designation: args.appObj.designation,
            admin: args.appObj.admin
        })
        .then(function (response) {
            context.commit('finishLoading');
            return true;
        })
        .catch(function (error) {
            console.log('Encountered an error while trying to create new employee: ', error);
            context.commit('finishLoading');
            context.commit('updateErrorMsg', error.response.data);
            return false;
        });
    },
    updateAdminStatus(context, args){
        const entity = "employee";
        context.commit('startLoading');
        context.commit('updateLoadingMsg', `Updating Employee...`);
        console.log("going to try and update employee admin status now: ", args.editedItem);

        return this.$axios.$patch(baseAPIURL+entity+'/admin', {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            emp_id: args.editedItem.emp_id,
            admin: args.editedItem.admin
        })
        .then(function (response) {
            context.commit('finishLoading');
            context.dispatch('getAllEmployees');
            return true;
        })
        .catch(function (error) {
            console.log('Encountered an error while trying to update action: ', error.response.data.message);
            context.commit('finishLoading');
            return false;
        });
    },
    deleteEmployee(context, args){
        const entity = "employee";
        console.log("@#@#@# THIS IS THE Delete employee item par: ", args.appObj);
        context.commit('startLoading');
        context.commit('updateLoadingMsg', `Deleting employee...`);

        return this.$axios.$delete(baseAPIURL+entity, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            data: {
                emp_id: args.appObj.emp_id
            }
        })
        .then(function (response) {
            context.commit('finishLoading');
            context.dispatch('getAllEmployees');
            return true;
        })
        .catch(function (error) {
            console.log('Encountered an error while trying to delete employee: ', error);
            context.commit('finishLoading');
            context.dispatch('getAllEmployees');
            return false;
        });
    },
    updateEmployee(context, args){
        const entity = "employee";
        context.commit('startLoading');
        context.commit('updateLoadingMsg', `Updating ${entity}...`);

        return this.$axios.$patch(baseAPIURL+entity, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            emp_id: args.editedItem.emp_id,
            first_name: args.editedItem.first_name,
            last_name: args.editedItem.last_name,
            department: args.editedItem.department,
            designation: args.editedItem.designation,
        })
        .then(function (response) {
            context.commit('finishLoading');
            context.dispatch('getAllEmployees');
            return true;
        })
        .catch(function (error) {
            console.log('Encountered an error while trying to update employee: ', error.response.data.message);
            context.commit('finishLoading');
            return false;
        });
    },
    // authenticateUser(context, args){
    //     let authenticatedUser;
    //     const entity = "employee";
    //     console.log("### these are the args for empl auth: ", args);
    //     context.commit('startLoading');
    //     return this.$axios.$get(baseAPIURL+entity+`/auth/${args.empl_id}`, {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'X-Requested-With': 'XMLHttpRequest',
    //         },
    //     })
    //     .then(function (response) {
    //         console.log(`got back this response for ${entity}s: ${JSON.stringify(response)}`);
    //         context.commit('finishLoading');
    //         if(response.result.length == 1 && args.password == args.empl_id){
    //             context.commit('updateCurrentlyAuthenticatedEmployee', response.result[0]);
    //             return response.result[0];
    //         }
    //         else{
    //             context.commit('updateCurrentlyAuthenticatedEmployee', null);
    //             return null;
    //         }
    //     })
    //     .catch(function (error) {
    //         console.log(`Encountered an error while trying to fetch ${entity}s: ${error}`);
    //         context.commit('updateCurrentlyAuthenticatedEmployee', null);                
    //         context.commit('finishLoading');
    //     });
    // },
    // logoutUser(context){
    //     context.commit('updateCurrentlyAuthenticatedEmployee', null);
    // }
}