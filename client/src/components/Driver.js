import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
//components
import { isDriver } from '../services/AuthService';
import DriverDashboard from './DriverDashboard'; // new
import DriverDetail from './DriverDetail'; // new

function Driver(props) {
  if (!isDriver()) {
    return <Redirect to='/' />
  }

  return (
    <Switch>
      <Route path='/driver/:id' component={DriverDetail} />
      <Route component={DriverDashboard} />
    </Switch>
  );
}

export default Driver;