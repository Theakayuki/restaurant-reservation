import React from 'react';
import { useHistory } from 'react-router-dom';
import ErrorAlert from '../layout/ErrorAlert';
import { createReservation } from '../utils/api';
import ClientForm from './ClientForm';

function NewReservation() {
  const history = useHistory();
  const [reservationsError, setReservationsError] = React.useState(null);
  
  const parseDate = (date) =>  Date.parse(date);
  const isATuesDay = (date) => {
    const day = new Date(parseDate(date)).getUTCDay();
    return day === 2;
  };
  
  const pastDate = (date) => {
    const today = new Date();
    const resDate = new Date(parseDate(date));
    return resDate < today;
  };

  const isNotOpen = (time) => {
    // 10:30 is the earliest time a reservation can be made
    // 21:30 is the latest time a reservation can be made
    const openTime = new Date('2021-01-01 10:30');
    const closeTime = new Date('2021-01-01 21:30');
    const resTime = new Date(`2021-01-01 ${time}`);
    return resTime < openTime || resTime > closeTime;
  };

  async function submitReservation(reservation) {
    try {
      setReservationsError(null);
      await createReservation(reservation);
      history.push(`/dashboard?date=${reservation.reservation_date}`);
    } catch (error) {
      setReservationsError(error);
    }
  }

  const handleSubmit = (data) => {
    setReservationsError(null);

    if (pastDate(data.reservation_date)) {
      setReservationsError({ message: 'Reservations cannot be made in the past.' });
      return;
    }
    
    if (isATuesDay(data.reservation_date)) {
      setReservationsError({ message: 'The restaurant is closed on Tuesdays.' });
      return;
    }

    if (isNotOpen(data.reservation_time)) {
      setReservationsError({ message: 'The restaurant is not open at that time.' });
      return;
    }

    submitReservation(data);
  };

  return (
    <div>
      <h1>New Reservation</h1>
      <ErrorAlert error={reservationsError} />
      <ClientForm submitHandler={handleSubmit} />
    </div>
  );
}


export default NewReservation;
