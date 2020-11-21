const logIn = () => {
  const { username, password } = Cypress.env('credentials');

  // Capture HTTP requests.
  cy.server();
  cy.route({
    method: 'POST',
    url: '**/api/log_in/**',
    status: 200,
    response: {
      'access': 'ACCESS_TOKEN',
      'refresh': 'REFRESH_TOKEN'
    }
  }).as('logIn');

  // Log into the app.
  cy.visit('/#/log-in');
  cy.get('input#username').type(username);
  cy.get('input#password').type(password, { log: false });
  cy.get('button').contains('Log in').click();
  cy.wait('@logIn');
};

describe('Authentication', function () {
  it('Can log in.', function () {
    logIn();
    cy.hash().should('eq', '#/');
    cy.get('button').contains('Log out');
  });

  it('Can sign up.', function () {
    cy.visit('/#/sign-up');
    cy.get('input#username').type('gary.cole@example.com');
    cy.get('input#firstName').type('Gary');
    cy.get('input#lastName').type('Cole');
    cy.get('input#password').type('pAssw0rd', { log: false });
    cy.get('select#group').select('driver');
    cy.get('input#photo').attachFile('images/photo.jpg');
    cy.get('button').contains('Sign up').click();
    cy.hash().should('eq', '#/log-in');
  });

  it('Cannot visit the login page when logged in.', function () {
    logIn();
    cy.visit('/#/log-in');
    cy.hash().should('eq', '#/');
  });

  it('Cannot visit the sign up page when logged in.', function () {
    logIn();
    cy.visit('/#/sign-up');
    cy.hash().should('eq', '#/');
  });

  it('Cannot see links when logged in.', function () {
    logIn();
    cy.get('button#signUp').should('not.exist');
    cy.get('button#logIn').should('not.exist');
  });
});