import React, { useEffect, useState } from 'react';
import {
  Breadcrumb, Col, Row
} from 'react-bootstrap';
// import { webSocket } from 'rxjs/webSocket';
import { toast } from 'react-toastify';
import { connect, getTrips, messages } from '../services/TripService';


// import { getAccessToken } from '../services/AuthService';
import TripCard from './TripCard';


function DriverDashboard(props) {
  const [trips, setTrips] = useState([]);

  const updateToast = (trip) => {
    if (trip.driver === null) {
      toast.info(`Rider ${trip.rider.username} has requested a trip.`);
    }
  };

  useEffect(() => {
    connect();
    const subscription = messages.subscribe((message) => {
      setTrips(prevTrips => [
        ...prevTrips.filter(trip => trip.id !== message.data.id),
        message.data
      ]);
      updateToast(message.data);
    });
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    }
  }, [setTrips]);
  // useEffect(() => {
  //   const loadTrips = async () => {
  //     const { response, isError } = await getTrips();
  //     if (isError) {
  //       setTrips([]);
  //     } else {
  //       setTrips(response.data);
  //     }
  //   }
  //   loadTrips();
  // }, []);

  // useEffect(() => {
  //   const token = getAccessToken();
  //   const ws = webSocket(`ws://localhost:8003/taxi/?token=${token}`);
  //   const subscription = ws.subscribe((message) => {
  //     setTrips(prevTrips => [
  //       ...prevTrips.filter(trip => trip.id !== message.data.id),
  //       message.data
  //     ]);
  //     updateToast(message.data);
  //   });
  //   return () => {
  //     subscription.unsubscribe();
  //   }
  // }, []);




  const getCurrentTrips = () => {
    return trips.filter(trip => {
      return trip.driver !== null && trip.status !== 'COMPLETED';
    });
  }

  const getRequestedTrips = () => {
    return trips.filter(trip => {
      return trip.status === 'REQUESTED';
    });
  }

  const getCompletedTrips = () => {
    return trips.filter(trip => {
      return trip.status === 'COMPLETED';
    });
  }

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
          group='driver'
          otherGroup='rider'
        />
        {/* ======================================================
            The requested trips would be displayed in a bootstrap card
        ======================================================*/}
        <TripCard
          title='Requested Trips'
          trips={getRequestedTrips()}
          group='driver'
          otherGroup='rider'
        />
        {/* ======================================================
            The recent trips would be displayed in a bootstrap card
        ======================================================*/}
        <TripCard
          title='Recent Trips'
          trips={getCompletedTrips()}
          group='driver'
          otherGroup='rider'
        />

      </Col>
    </Row>
  );
}

export default DriverDashboard;