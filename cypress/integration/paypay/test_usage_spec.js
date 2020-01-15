describe("Review Creation", function() {
    it("Review can be created successfully", function() {
        cy.visit("/review")
        cy.get(".btnAddNewReview").click()
        cy.url().should('include', '/review/new')
        cy.get(':nth-child(2) > .v-input__control > .v-input__slot > .v-select__slot > .v-select__selections').click()
        cy.get('.v-list-item:nth-child(1)').click();
        cy.get('.v-input:nth-child(3) .v-select__selections').click();
        cy.get('#list-item-68-0').click();
        cy.get("textarea[name='review_writeup']").type('Great employee! Performed really well over the last year!');
        cy.get('#input-47').click();
        cy.get('#list-47 > .v-list-item:nth-child(1)').click();
        cy.get('.btnAddNewReview').click();
        cy.url().should('include', '/review');
    })
})

describe("Employee Creation", function() {
    it("Employee can be created successfully", function() {
        cy.visit("/employee")
        cy.get(".btnAddNewEmployee").click()
        cy.url().should('include', '/employee/new')
        cy.get("input[name='emp_id']").type("1070")
        cy.get("input[name='emp_fname']").type("James")
        cy.get("input[name='emp_lname']").type("Bond")
        cy.get("input[name='emp_dept']").type("Espionage")
        cy.get("input[name='emp_designation']").type("Spy")
        cy.get(".btnCreateNewEmployee").click()
        cy.url().should('include', '/employee')
        cy.get('tr > .text-left').should('contain','1070')
    })
})

describe("Employee Page works", function() {
    it("Employee view loads table and displays data", function() {
        cy.visit("/employee")
        cy.get('tbody > :nth-child(1) > .text-left').contains('100');
    })
})

describe("Review Page works", function() {
    it("Review page loads table and displays data", function() {
        cy.visit("/review")
        cy.get('tbody > :nth-child(1) > :nth-child(4)').contains('100');
    })
})

describe("Feedback Page works", function() {
    it("Feedback page loads table and displays data", function() {
        cy.visit("/feedback")
        cy.get('tbody > :nth-child(1) > :nth-child(4)').contains('100');
    })
})