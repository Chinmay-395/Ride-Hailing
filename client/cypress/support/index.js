import 'cypress-file-upload';

const addUser = (email, firstName, lastName, userType) => {
  cy.server();
  cy.route('POST', '**/api/sign_up/**').as('signUp');

  cy.visit('/#/sign-up');
  cy.get('input#username').type(email);
  cy.get('input#firstName').type(firstName);
  cy.get('input#lastName').type(lastName);
  cy.get('input#password').type('pAssw0rd', { log: false });
  cy.get('select#group').select(userType);

  // Handle file upload
  cy.get('input#photo').attachFile('images/photo.jpg');

  cy.get('button').contains('Sign up').click();
  cy.wait('@signUp');
  cy.hash().should('eq', '#/log-in');
}

// new
Cypress.Commands.add('addUser', addUser);