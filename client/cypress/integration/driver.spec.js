const faker = require('faker');

const driverEmail = faker.internet.email();
const driverFirstName = faker.name.firstName();
const driverLastName = faker.name.lastName();
const riderEmail = faker.internet.email();
const riderFirstName = faker.name.firstName();
const riderLastName = faker.name.lastName();

describe('The driver dashboard', function () {

  before(function () {
    cy.addUser(riderEmail, riderFirstName, riderLastName, 'rider');
    cy.addUser(driverEmail, driverFirstName, driverLastName, 'driver');
  })

  it('Can be visited if the user is a driver', function () {
    cy.server();
    cy.route('POST', '**/api/log_in/').as('logIn');

    cy.logIn(driverEmail); // new

    cy.visit('/#/driver');
    cy.hash().should('eq', '#/driver');
  })


  it('Can be visited if the user is a driver', function () {
    cy.server();
    cy.route('POST', '**/api/log_in/').as('logIn');

    cy.logIn(driverEmail); // new

    cy.visit('/#/driver');
    cy.hash().should('eq', '#/driver');
  })
})