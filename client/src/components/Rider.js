import React from 'react';
import {
  Breadcrumb, Card, Col, Row
} from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import { isRider } from '../services/AuthService';

function Rider(props) {
  if (!isRider()) {
    return <Redirect to='/' />
  }
  return (
    <Row>
      <Col lg={12}>
        <Breadcrumb>
          <Breadcrumb.Item href='/'>Home</Breadcrumb.Item>
          <Breadcrumb.Item active>Dashboard</Breadcrumb.Item>
        </Breadcrumb>
        <Card className='mb-3'>
          <Card.Header>Current Trip</Card.Header>
          <Card.Body>
            No trips.
          </Card.Body>
        </Card>
        <Card className='mb-3'>
          <Card.Header>Recent Trips</Card.Header>
          <Card.Body>
            No trips.
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default Rider;