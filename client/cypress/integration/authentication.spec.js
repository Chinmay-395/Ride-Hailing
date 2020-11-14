describe('Authentication', function () {
  it('Can log in.', function () {
    cy.visit('/#/log-in');
    cy.get('input#username').type('gary.cole@example.com');
    cy.get('input#password').type('pAssw0rd', { log: false });
    cy.get('button').contains('Log in').click();
    cy.hash().should('eq', '#/');
  });
});