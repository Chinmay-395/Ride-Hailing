import axios from 'axios';
import { share } from 'rxjs/operators'; // new
import { webSocket } from 'rxjs/webSocket'; // new

import { getAccessToken } from './AuthService';

let _socket; // new
export let messages; // new

// new
export const connect = () => {
  if (!_socket || _socket.closed) {
    const token = getAccessToken();
    _socket = webSocket(`ws://localhost:8003/taxi/?token=${token}`);
    messages = _socket.pipe(share());
    messages.subscribe(message => console.log(message));
  }
};

// new
export const createTrip = (trip) => {
  connect();
  const message = {
    type: 'create.trip',
    data: trip
  };
  _socket.next(message);
};

//This is "TripDetail" 
export const getTrip = async (id) => {
  const url = `${process.env.REACT_APP_BASE_URL}/api/trip/${id}/`;
  const token = getAccessToken();
  const headers = { Authorization: `Bearer ${token}` };
  try {
    const response = await axios.get(url, { headers });
    return { response, isError: false };
  } catch (response) {
    return { response, isError: true };
  }
};
//This is "TripList" 
export const getTrips = async () => {
  const url = `${process.env.REACT_APP_BASE_URL}/api/trip/`;
  const token = getAccessToken();
  const headers = { Authorization: `Bearer ${token}` };
  try {
    const response = await axios.get(url, { headers });
    return { response, isError: false };
  } catch (response) {
    return { response, isError: true };
  }
};