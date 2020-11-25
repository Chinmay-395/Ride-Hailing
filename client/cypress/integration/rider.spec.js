const faker = require('faker');

// const randomEmailDriver = faker.internet.email();  // changed
// const randomEmailRider = faker.internet.email();  // new

const driverEmail = faker.internet.email();
const driverFirstName = faker.name.firstName();
const driverLastName = faker.name.lastName();
const riderEmail = faker.internet.email();
const riderFirstName = faker.name.firstName();
const riderLastName = faker.name.lastName();

describe('The rider dashboard', function () {


  it('Cannot be visited if the user is not a rider', function () {
    cy.server();
    // cy.route('POST', '**/api/sign_up/**').as('signUp');
    cy.route('POST', '**/api/log_in/').as('logIn');
    // // A driver SignsUp
    // cy.visit('/#/sign-up');
    // cy.get('input#username').type(randomEmailDriver);
    // cy.get('input#firstName').type('Gary');
    // cy.get('input#lastName').type('Cole');
    // cy.get('input#password').type('pAssw0rd', { log: false });
    // cy.get('select#group').select('driver');
    // ////// Handle file upload
    // cy.get('input#photo').attachFile('images/photo.jpg');

    // cy.get('button').contains('Sign up').click();
    // cy.wait('@signUp');
    // cy.hash().should('eq', '#/log-in');
    cy.addUser(driverEmail, driverFirstName, driverLastName, 'driver');

    // The driver who signedUp now LogsIn.
    cy.visit('/#/log-in');
    cy.get('input#username').type(driverEmail);
    cy.get('input#password').type('pAssw0rd', { log: false });
    cy.get('button').contains('Log in').click();
    cy.hash().should('eq', '#/');
    cy.get('button').contains('Log out');
    cy.wait('@logIn');

    // The driver now visits the rider page but is not allowed.
    cy.visit('/#/rider');
    cy.hash().should('eq', '#/');
  })


  it('Can be visited if the user is a rider', function () {
    cy.server();
    // cy.route('POST', '**/api/sign_up/**').as('signUp');
    cy.route('POST', '**/api/log_in/').as('logIn');

    // cy.visit('/#/sign-up');
    // cy.get('input#username').type(randomEmailRider);
    // cy.get('input#firstName').type('Gary');
    // cy.get('input#lastName').type('Cole');
    // cy.get('input#password').type('pAssw0rd', { log: false });
    // cy.get('select#group').select('rider');

    // // Handle file upload
    // cy.get('input#photo').attachFile('images/photo.jpg');

    // cy.get('button').contains('Sign up').click();
    // cy.wait('@signUp');
    // cy.hash().should('eq', '#/log-in');

    cy.addUser(riderEmail, riderFirstName, riderLastName, 'rider');
    // Log in.
    cy.visit('/#/log-in');
    cy.get('input#username').type(riderEmail);
    cy.get('input#password').type('pAssw0rd', { log: false });
    cy.get('button').contains('Log in').click();
    cy.hash().should('eq', '#/');
    cy.get('button').contains('Log out');
    cy.wait('@logIn');

    cy.visit('/#/rider');
    cy.hash().should('eq', '#/rider');
  })
})