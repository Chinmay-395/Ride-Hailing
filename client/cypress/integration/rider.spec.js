const faker = require('faker');

const driverEmail = faker.internet.email();
const driverFirstName = faker.name.firstName();
const driverLastName = faker.name.lastName();
const riderEmail = faker.internet.email();
const riderFirstName = faker.name.firstName();
const riderLastName = faker.name.lastName();

describe('The rider dashboard', function () {

  before(function () {
    cy.addUser(riderEmail, riderFirstName, riderLastName, 'rider');
    cy.addUser(driverEmail, driverFirstName, driverLastName, 'driver');
  })

  it('Cannot be visited if the user is not a rider', function () {
    cy.server();
    cy.route('POST', '**/api/log_in/').as('logIn');

    cy.logIn(driverEmail);  // new

    cy.visit('/#/rider');
    cy.hash().should('eq', '#/');
  })


  it('Can be visited if the user is a rider', function () {
    cy.server();
    cy.route('POST', '**/api/log_in/').as('logIn');

    cy.logIn(riderEmail); // new

    cy.visit('/#/rider');
    cy.hash().should('eq', '#/rider');
  })
})