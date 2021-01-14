describe('Navigation', () => {
  it('Can navigate to sign up from home', () => {
    cy.visit('/#/');
    cy.get('a').contains('Sign up').click();
    cy.hash().should('eq', '#/sign-up');
  });


  it('Can navigate to log in from home', () => {
    cy.visit('/#/');
    cy.get('a').contains('Log in').click();
    cy.hash().should('eq', '#/log-in');
  });


  it('Can navigate to home from sign up', () => {
    cy.visit('/#/sign-up');
    cy.get('a').contains('Home').click();
    cy.hash().should('eq', '#/');
  });


  it('Can navigate to log in from sign up', () => {
    cy.visit('/#/sign-up');
    cy.get('a').contains('Log in').click();
    cy.hash().should('eq', '#/log-in');
  });


  it('Can navigate to home from log in', () => {
    cy.visit('/#/log-in');
    cy.get('a').contains('Home').click();
    cy.hash().should('eq', '#/');
  });


  it('Can navigate to sign up from log in', () => {
    cy.visit('/#/log-in');
    cy.get('a').contains('Sign up').click();
    cy.hash().should('eq', '#/sign-up');
  });
});