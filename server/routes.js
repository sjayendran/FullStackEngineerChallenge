const {dbConfig} = require('./sec.js');

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

async function routes (fastify, options) {
    const cnxnString = `mysql://${dbConfig.username}:${dbConfig.pwd}@${dbConfig.server}:${dbConfig.port}/`;
    fastify.register(require('fastify-mysql'), {
        promise: true,
        connectionString: cnxnString,
        dateStrings: false
    })

    fastify.setErrorHandler(function (error, request, reply) {
        request.log.warn(error)
        var statusCode = error.statusCode >= 400 ? error.statusCode : 500
        reply
            .code(statusCode)
            .type('text/plain')
            .send(error.message)
    })
  
    fastify.get('/', async (req, reply) => {
      return { 'paypay': 'challenge' }
    })

    //EMPLOYEE ROUTES [GET, POST, PATCH, DELETE]

    //not used as this was planned if login flows were going to be implemented
    fastify.get('/employee/auth/:emplID', async (req, reply) => {
        let specificEmployeeSQL = `SELECT * FROM ${dbConfig.dbName}.employee 
                                    WHERE emp_id = '${req.params.emplID}';`

        const [rows, fields] = await fastify.mysql.query(
            specificEmployeeSQL,
        )

        if(rows.length > 0)
        {
            return({"result": rows});
        }
        else
            return({"result": []});
    });

    fastify.get('/employee', async (req, reply) => {
        let allEmployeeSQL = `SELECT * FROM ${dbConfig.dbName}.employee
                                ORDER BY emp_id;`

        const [rows, fields] = await fastify.mysql.query(
            allEmployeeSQL,
        )

        if(rows.length > 0)
        {
            return({"result": rows});
        }
        else
            return({"result": []});
    });

    fastify.post('/employee', async (req, reply) => {
        let createNewEmployeeSQL = `INSERT INTO ${dbConfig.dbName}.employee
                                    (
                                        emp_id, 
                                        first_name, 
                                        last_name, 
                                        department,
                                        designation,
                                        admin
                                    )
                                    VALUES
                                    (
                                        "${req.body.emp_id}", 
                                        "${req.body.first_name}", 
                                        "${req.body.last_name}",  
                                        "${req.body.department}",
                                        "${req.body.designation}",
                                        "${req.body.admin}"
                                    );`
        const [rows, fields] = await fastify.mysql.query(
            createNewEmployeeSQL,
        );

        reply.code(204);
    });

    fastify.patch('/employee/admin', async (req, reply) => {
        let updateExistingEmployeeAdminStatusSQL = `UPDATE ${dbConfig.dbName}.employee
                                SET admin = ${req.body.admin}
                                WHERE emp_id = ${req.body.emp_id};`
        
        const [rows, fields] = await fastify.mysql.query(
            updateExistingEmployeeAdminStatusSQL,
        );

        reply.code(204);
    });

    fastify.patch('/employee', async (req, reply) => {
        let first_name_part = req.body.first_name ? `first_name = '${req.body.first_name}',` : '';
        let last_name_part = req.body.last_name ? `last_name = '${req.body.last_name}',` : '';
        let department_part = req.body.department ? `department = '${req.body.department}',` : '';
        let designation_part = req.body.designation ? `designation = '${req.body.designation}'` : '';

        let updateExistingEmployeeSQL = `UPDATE ${dbConfig.dbName}.employee
                                SET ${first_name_part} ${last_name_part}
                                ${department_part} ${designation_part}
                                WHERE emp_id = ${req.body.emp_id};`
        
        const [rows, fields] = await fastify.mysql.query(
            updateExistingEmployeeSQL,
        );

        reply.code(204);
    });

    fastify.delete('/employee', async (req, reply) => {
        let deleteEmployeeSQL = `DELETE FROM ${dbConfig.dbName}.employee 
                            WHERE emp_id = "${req.body.emp_id}";`

        const [rows, fields] = await fastify.mysql.query(
            deleteEmployeeSQL,
        )

        reply.code(204);
    });

    //review ROUTES [GET, POST, PATCH, DELETE]

    fastify.get('/review', async (req, reply) => {
        let allReviewSQL = `SELECT * FROM ${dbConfig.dbName}.review;`

        const [rows, fields] = await fastify.mysql.query(
            allReviewSQL,
        )

        if(rows.length > 0)
        {
            return({"result": rows});
        }
        else
            return({"result": []});
    });

    fastify.post('/review', async (req, reply) => {
        let createNewReviewSQL = `INSERT INTO ${dbConfig.dbName}.review
                                    (
                                        writeup,
                                        feedback_emp_list,
                                        review_year,
                                        emp_id
                                    )
                                    VALUES
                                    (
                                        "${req.body.writeup}", 
                                        "${req.body.feedback_emp_list}", 
                                        ${req.body.review_year}, 
                                        ${req.body.emp_id}
                                    );`
        
        console.log("##### this is the SQL statement for creating review: ", createNewReviewSQL);
        const [rows, fields] = await fastify.mysql.query(
            createNewReviewSQL,
        );

        reply.code(204);
    });

    fastify.delete('/review', async (req, reply) => {
        let deleteReviewSQL = `DELETE FROM ${dbConfig.dbName}.review 
                            WHERE _id = ${req.body.id};`

        console.log("this is the delete review SQL: ", deleteReviewSQL);

        const [rows, fields] = await fastify.mysql.query(
            deleteReviewSQL,
        )

        reply.code(204);
    });

    fastify.patch('/review', async (req, reply) => {
        let updateExistingReviewSQL = `UPDATE ${dbConfig.dbName}.review
                                        SET writeup = "${req.body.writeup}",
                                        feedback_emp_list = '${req.body.feedback_emp_list}'
                                        WHERE _id = ${req.body.id};`
        
        console.log("#### updating review with this SQL: ", updateExistingReviewSQL);
        const [rows, fields] = await fastify.mysql.query(
            updateExistingReviewSQL,
        );

        //return a HTTP 204 rather than a null result
        reply.code(204);
    });

    fastify.get('/review/:for_emp_id', async (req, reply) => {
        console.log("### args for select reviews are: ", req.params);
        let selectedReviewsSQL = `SELECT * FROM ${dbConfig.dbName}.review
                                    WHERE feedback_emp_list LIKE '%${req.params.for_emp_id}%';`

        const [rows, fields] = await fastify.mysql.query(
            selectedReviewsSQL,
        )

        if(rows.length > 0)
        {
            return({"result": rows});
        }
        else
            return({"result": []});
    });

    //FEEDBACK ROUTES [GET, POST, PATCH, DELETE]

    fastify.get('/feedback/:for_emp_id', async (req, reply) => {
        let allFeedbackSQL = `SELECT * FROM ${dbConfig.dbName}.feedback
                                WHERE author_emp_id = ${req.params.for_emp_id};`

        const [rows, fields] = await fastify.mysql.query(
            allFeedbackSQL,
        )

        if(rows.length > 0)
        {
            return({"result": rows});
        }
        else
            return({"result": []});
    });

    fastify.post('/feedback', async (req, reply) => {
        let createNewFeedbackSQL = `INSERT INTO ${dbConfig.dbName}.feedback
                                    (
                                        author_emp_id,
                                        review_id,
                                        writeup
                                    )
                                    VALUES
                                    (
                                        "${req.body.author_emp_id}",
                                        ${req.body.review_id},
                                        "${req.body.writeup}"
                                    );`
        
        const [rows, fields] = await fastify.mysql.query(
            createNewFeedbackSQL,
        );

        reply.code(204);
    });

    fastify.patch('/feedback', async (req, reply) => {
        let updateExistingFeedbackSQL = `UPDATE ${dbConfig.dbName}.feedback
                                        SET writeup = "${req.body.writeup}"
                                        WHERE _id = ${req.body.id};`
                
        const [rows, fields] = await fastify.mysql.query(
            updateExistingFeedbackSQL,
        );

        //return a HTTP 204 rather than a null result
        reply.code(204);
    });

    fastify.delete('/feedback', async (req, reply) => {
        let deleteFeedbackSQL = `DELETE FROM ${dbConfig.dbName}.feedback WHERE _id = ${req.body.id};`
        console.log("###### this is the SQL ot delete feedback: ", deleteFeedbackSQL);
        const [rows, fields] = await fastify.mysql.query(
            deleteFeedbackSQL,
        )

        reply.code(204);
    });
}  
  module.exports = routes