import React from 'react';
import { Button, Media } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

function TripMedia({ trip, group, otherGroup }) {
  const user = trip[otherGroup];
  /**Sometimes the Django server returns an absolute URL and other times 
   * it returns a relative URL. The code above allows us to always get
   * an absolute URL, so that our images will always load properly. 
   * (Using a reverse proxy like Nginx negates the need for the photoUrl variable 
   * since the server and client are served from the same host.) */
  const photoUrl = new URL(user.photo, process.env.REACT_APP_BASE_URL).href;
  const href = group ? `/${group}/${trip.id}` : undefined;

  return (
    <Media as='li'>
      <img
        alt={user}
        className='mr-3 rounded-circle'
        src={photoUrl}
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