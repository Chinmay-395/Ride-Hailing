import React, { useEffect, useState } from 'react';
import {
  Breadcrumb, Col, Row
} from 'react-bootstrap';

import TripCard from './TripCard';
import { getTrips } from '../services/TripService';


function Rider(props) {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const loadTrips = async () => {
      const { response, isError } = await getTrips();
      if (isError) {
        setTrips([]);
      } else {
        setTrips(response.data);
      }
    }
    loadTrips();
  }, []);

  const getCurrentTrips = () => {
    /* ===========================================================
        These functions filter the trips so that we can put them in
        the right buckets. Current trips are any trips that have been
        requested but not started yet. A trip that does not have a driver
        and is not completed is considered a current trip.
    =========================================================== */
    return trips.filter(trip => {
      return (
        trip.driver !== null &&
        trip.status !== 'REQUESTED' &&
        trip.status !== 'COMPLETED'
      );
    });
  };

  const getCompletedTrips = () => {
    return trips.filter(trip => {
      return trip.status === 'COMPLETED';
    });
  };


  return (
    <Row>
      <Col lg={12}>
        <Breadcrumb>
          <Breadcrumb.Item href='/'>Home</Breadcrumb.Item>
          <Breadcrumb.Item active>Dashboard</Breadcrumb.Item>
        </Breadcrumb>
        {/* ======================================================
            The current trip would be displayed in a bootstrap card
        ======================================================*/}
        <TripCard
          title='Current Trip'
          trips={getCurrentTrips()}
          group='rider'
          otherGroup='driver'
        />
        {/* ======================================================
            The recent trips would be displayed in a bootstrap card
        ======================================================*/}
        <TripCard
          title='Recent Trips'
          trips={getCompletedTrips()}
          group='rider'
          otherGroup='driver'
        />
      </Col>
    </Row>
  );
}

export default Rider;