import React, { useEffect, useState } from "react";
import { next, previous } from "../utils/date-time";

import DisplayReservation from "../reservations/DisplayReservation";
import ErrorAlert from "../layout/ErrorAlert";
import { listReservations } from "../utils/api";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [dateState, setDateState] = useState(date);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }


  function todaysDate() {
    setDateState(date);
  }

  function previousDate() {
    const previousDate = previous(dateState);
    setDateState(previousDate);
  }

  function nextDate() {
    const nextDate = next(dateState);
    setDateState(nextDate);
  }



  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex flex-column mb-3">
        <h4 className="mb-0 col-3">Reservations for date</h4>
          <h5 className="mb-0">{dateState}</h5>
        <div className="ml-md-3 mb-3">
          <div>
            <button
              type="button"
              className="btn btn-secondary me-1"
              onClick={previousDate}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary me-1"
              onClick={todaysDate}
            >
              Today
            </button>
            <button
              type="button"
              className="btn btn-secondary ml-1"
              onClick={nextDate}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ErrorAlert error={reservationsError} />
      {/* {JSON.stringify(reservations)} */}
      {reservations.length > 0 ? (
        reservations.map((reservation) => (
          <DisplayReservation key={reservation.reservation_id} reservation={reservation} />
        ))
      ) : (
        <h4>No reservations found</h4>
      )}
    </main>
  );
}

export default Dashboard;
