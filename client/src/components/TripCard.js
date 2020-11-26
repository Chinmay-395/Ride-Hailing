import React from 'react';
import { Card } from 'react-bootstrap';

import TripMedia from './TripMedia';

function TripCard({ title, trips, group, otherGroup }) {
  /** ========================================================================
    The TripCard component will draw a Bootstrap Card using the properties
    supplied by the caller. If the provided trips are empty, then the component
    will display a "No trips" message. If trips exist, then the component will
    display a list of Media components.
  ======================================================================== */
  let cardBody;
  let mediaList;

  if (trips.length === 0) {
    cardBody = <>No trips.</>
  } else {
    mediaList = trips.map(trip =>
      <TripMedia
        trip={trip}
        group={group}
        otherGroup={otherGroup}
        key={trip.id}
      />
    )
    cardBody = <ul className='list-unstyled mb-0'>{mediaList}</ul>
  }
  return (
    <Card className='mb-3' data-cy='trip-card'>
      <Card.Header>{title}</Card.Header>
      <Card.Body>{cardBody}</Card.Body>
    </Card>
  )
}

export default TripCard;