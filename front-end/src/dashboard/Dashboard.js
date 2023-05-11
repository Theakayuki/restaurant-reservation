import React, { useEffect, useState } from 'react';
import { next, previous } from '../utils/date-time';

import { useHistory } from 'react-router-dom';
import ErrorAlert from '../layout/ErrorAlert';
import DisplayReservation from '../reservations/DisplayReservation';
import { listReservations } from '../utils/api';

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const history = useHistory();

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
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const todaysDate = `${year}-${month}-${day}`;
    history.push(`/dashboard?date=${todaysDate}`);
  }

  function previousDate() {
    const previousDate = previous(date);
    history.push(`/dashboard?date=${previousDate}`);
  }

  function nextDate() {
    const nextDate = next(date);
    history.push(`/dashboard?date=${nextDate}`);
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className='d-md-flex flex-column mb-3'>
        <h4 className='mb-3 col-3'>Reservations for date</h4>
        <h5 className='mb-3'>{date}</h5>
        <div className='ml-md-3 mb-3'>
          <div>
            <button type='button' className='btn btn-secondary me-2' onClick={previousDate}>
              Previous
            </button>
            <button type='button' className='btn btn-secondary me-2' onClick={todaysDate}>
              Today
            </button>
            <button type='button' className='btn btn-secondary ml-1' onClick={nextDate}>
              Next
            </button>
          </div>
        </div>
      </div>

      <ErrorAlert error={reservationsError} />
      {/* {JSON.stringify(reservations)} */}
      <div className='d-flex flex-wrap'>
        {reservations.length > 0 ? (
          reservations.map((reservation) => (
            <DisplayReservation key={reservation.reservation_id} reservation={reservation} />
          ))
        ) : (
          <h4>No reservations found</h4>
        )}
      </div>
    </main>
  );
}

export default Dashboard;
