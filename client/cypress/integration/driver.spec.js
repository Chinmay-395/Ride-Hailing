const tripResponse = [
  {
    id: "94fc5eba-de7a-44b2-8000-856ec824609d",
    created: "2020-08-18T21:41:08.112946Z",
    updated: "2020-08-18T21:41:08.112986Z",
    pick_up_address: "A",
    drop_off_address: "B",
    status: "STARTED",
    driver: {
      id: 113,
      photo: "http://localhost:8003/media/photos/photo_QI0TTYh.jpg",
    },
    rider: {
      id: 112,
      photo: "http://localhost:8003/media/photos/photo_r3XrvgH.jpg",
    }
  },
  {
    id: "94fc5eba-de7a-44b2-8000-856ec824609d",
    created: "2020-08-18T21:41:08.112946Z",
    updated: "2020-08-18T21:41:08.112986Z",
    pick_up_address: "A",
    drop_off_address: "B",
    status: "REQUESTED",
    driver: {
      id: 113,
      photo: "http://localhost:8003/media/photos/photo_QI0TTYh.jpg",
    },
    rider: {
      id: 112,
      photo: "http://localhost:8003/media/photos/photo_r3XrvgH.jpg",
    }
  },
  {
    id: "94fc5eba-de7a-44b2-8000-856ec824609d",
    created: "2020-08-18T21:41:08.112946Z",
    updated: "2020-08-18T21:41:08.112986Z",
    pick_up_address: "A",
    drop_off_address: "B",
    status: "COMPLETED",
    driver: {
      id: 113,
      photo: "http://localhost:8003/media/photos/photo_QI0TTYh.jpg",
    },
    rider: {
      id: 112,
      photo: "http://localhost:8003/media/photos/photo_r3XrvgH.jpg",
    }
  }
];
const { webSocket } = require('rxjs/webSocket');

const faker = require('faker');

const driverEmail = faker.internet.email();
const driverFirstName = faker.name.firstName();
const driverLastName = faker.name.lastName();
const riderEmail = faker.internet.email();
const riderFirstName = faker.name.firstName();
const riderLastName = faker.name.lastName();

describe('The driver dashboard', function () {
  // new
  before(function () {
    cy.addUser(riderEmail, riderFirstName, riderLastName, 'rider');
    cy.addUser(driverEmail, driverFirstName, driverLastName, 'driver');
  })

  it('Cannot be visited if the user is not a driver', function () {
    cy.intercept('POST', 'log_in').as('logIn');

    cy.logIn(riderEmail);  // new

    cy.visit('/#/driver');
    cy.hash().should('eq', '#/');
  });

  it('Can be visited if the user is a driver', function () {
    cy.intercept('POST', 'log_in').as('logIn');

    cy.logIn(driverEmail); // new

    cy.visit('/#/driver');
    cy.hash().should('eq', '#/driver');
  });

  it('Displays messages for no trips', function () {
    cy.intercept('trip', {
      statusCode: 200,
      body: []
    }).as('getTrips');

    cy.logIn(riderEmail);

    cy.visit('/#/rider');
    cy.wait('@getTrips');

    // Current trips.
    cy.get('[data-cy=trip-card]')
      .eq(0)
      .contains('No trips.');

    // Completed trips.
    cy.get('[data-cy=trip-card]')
      .eq(1)
      .contains('No trips.');
  });

  it('Displays current, requested, and completed trips', function () {
    cy.intercept('trip', {
      statusCode: 200,
      body: tripResponse
    }).as('getTrips');

    cy.logIn(driverEmail);

    cy.visit('/#/driver');
    cy.wait('@getTrips');

    // Current trips.
    cy.get('[data-cy=trip-card]')
      .eq(0)
      .contains('STARTED');

    // Requested trips.
    cy.get('[data-cy=trip-card]')
      .eq(1)
      .contains('REQUESTED');

    // Completed trips.
    cy.get('[data-cy=trip-card]')
      .eq(2)
      .contains('COMPLETED');
  });

  it('Can receive a ride request', function () {
    cy.intercept('trip', {
      statusCode: 200,
      body: []
    }).as('getTrips');

    cy.logIn(driverEmail);

    cy.visit('/#/driver');
    cy.wait('@getTrips');

    // Requested trips.
    cy.get('[data-cy=trip-card]')
      .eq(1)
      .contains('No trips.');

    // Make trip request as rider.
    cy.request({
      method: 'POST',
      url: 'http://localhost:8003/api/log_in/',
      body: {
        "username": riderEmail,
        "password": "pAssw0rd"
      }
    }).then((response) => {
      const token = response.body.access;
      const ws = webSocket(`ws://localhost:8003/taxi/?token=${token}`);
      ws.subscribe();
      ws.next({
        type: 'create.trip',
        data: {
          pick_up_address: '123 Main Street',
          drop_off_address: '456 Elm Street',
          rider: 2
        }
      });
    });

    // Requested trips.
    cy.get('[data-cy=trip-card]')
      .eq(1)
      .contains('REQUESTED');
  });
});