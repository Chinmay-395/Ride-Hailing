import React from 'react';
import { Button, Media } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

function TripMedia({ trip, group, otherGroup }) {
  /* ===================================================
    The TripMedia component takes a trip and an otherGroup 
    property and uses them to display data. The otherGroup 
    property is used to find the user of the opposite group.
    In other words, if the user is a rider, then the other
    user is the driver, and vice versa.
  =================================================== */
  const user = trip[otherGroup];
  const href = group ? `/${group}/${trip.id}` : undefined;

  return (
    <Media as='li'>
      <img
        alt={user}
        className='mr-3 rounded-circle'
        src={user.photo}
        width={80}
        height={80}
      />
      <Media.Body>
        <h5 className='mt-0 mb-1'>{user.first_name} {user.last_name}</h5>
        {trip.pick_up_address} to {trip.drop_off_address}<br />
        {trip.status}
        {
          href &&
          <LinkContainer to={href}>
            <Button variant='primary' block>Detail</Button>
          </LinkContainer>
        }
      </Media.Body>
    </Media>
  );
}

export default TripMedia;