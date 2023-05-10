import { Redirect, Route, Switch, useLocation } from "react-router-dom";

import React from "react";
import Dashboard from "../dashboard/Dashboard";
import NewReservation from "../reservations/NewReservation";
import { today } from "../utils/date-time";
import NotFound from "./NotFound";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  const query = useQuery();
  const date = query.get('date') ? query.get('date') : today(); 
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/dashboard">
        <Dashboard date={date} />
      </Route>
      <Route path={['/reservations/new', '/reservations/:reservation_id/edit']}>
        <NewReservation />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

// have to make a custom hook to extract to function.
function useQuery(){
  return new URLSearchParams(useLocation().search);
}

export default Routes;
