import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import RiderDashboard from './RiderDashboard';
import RiderDetail from './RiderDetail';
import { isRider } from '../services/AuthService';
import RiderRequest from './RiderRequest';

function Rider(props) {
  if (!isRider()) {
    return <Redirect to='/' />
  }

  return (
    <Switch>
      {/* =========================================================================
          This new code adds the routing to explicitly point to the RiderRequest 
          component. Note that the /rider/request route comes before the /rider/:id route.
          This is important because the /rider/:id route will match any /rider/* pattern.
          The order matters. 
          ========================================================================= */}
      <Route path='/rider/request' component={RiderRequest} />
      <Route path='/rider/:id' component={RiderDetail} />
      <Route component={RiderDashboard} />
    </Switch>
  )
}

export default Rider;