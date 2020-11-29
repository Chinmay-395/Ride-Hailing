import React, { useEffect, useState } from 'react';
import {
  Breadcrumb, Col, Row
} from 'react-bootstrap';
import { webSocket } from 'rxjs/webSocket';
import { toast } from 'react-toastify';


import TripCard from './TripCard';
import { getTrips } from '../services/TripService';
import { getAccessToken } from '../services/AuthService';


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

  useEffect(() => {
    const token = getAccessToken();
    const ws = webSocket(`ws://localhost:8003/taxi/?token=${token}`);
    const subscription = ws.subscribe((message) => {
      setTrips(prevTrips => [
        ...prevTrips.filter(trip => trip.id !== message.data.id),
        message.data
      ]);
      updateToast(message.data);
    });
    return () => {
      subscription.unsubscribe();
    }
  }, []);

  const updateToast = (trip) => {
    if (trip.status === 'STARTED') {
      toast.info(`Driver ${trip.driver.username} is coming to pick you up.`);
    } else if (trip.status === 'IN_PROGRESS') {
      toast.info(`Driver ${trip.driver.username} is headed to your destination.`);
    } else if (trip.status === 'COMPLETED') {
      toast.info(`Driver ${trip.driver.username} has dropped you off.`);
    }
  };

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