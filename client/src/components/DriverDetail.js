import React, { useEffect, useState } from 'react';
import {
  Breadcrumb, Card, Col, Row
} from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap';

import TripMedia from './TripMedia';
import { getTrip } from '../services/TripService';
/* ========================================================
  As the React Router documentation states, 
  "a match object contains information about how a <Route path> matched the URL."
 ======================================================== */
function DriverDetail({ match }) {
  /**
   * When a user clicks on a trip card from the dashboard, it will link to 
   * the detail via the trip's ID. The useEffect() hook listens for changes 
   * to the match object and loads the data for the given trip into the component. 
   * Whenever the data finishes loading, the component will display the trip information.
   */
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    const loadTrip = async (id) => {
      const { response, isError } = await getTrip(id);
      if (isError) {
        setTrip(null);
      } else {
        setTrip(response.data);
      }
    }
    loadTrip(match.params.id);
  }, [match]);

  let tripMedia;

  if (trip === null) {
    tripMedia = <>Loading...</>;
  } else {
    tripMedia = (
      <TripMedia
        trip={trip}
        otherGroup='rider'
      />
    )
  }

  return (
    <Row>
      <Col lg={12}>
        <Breadcrumb>
          <LinkContainer to='/driver'>
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
          </LinkContainer>
          <Breadcrumb.Item active>Trip</Breadcrumb.Item>
        </Breadcrumb>
        <Card className='mb-3' data-cy='trip-card'>
          <Card.Header>Trip</Card.Header>
          <Card.Body>{tripMedia}</Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default DriverDetail;