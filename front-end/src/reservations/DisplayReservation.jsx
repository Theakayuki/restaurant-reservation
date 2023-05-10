
const DisplayReservation = ({ reservation }) => {
  return (
    <div className='card'>
      <div className='card-body'>
        <h5 className='card-title'>{reservation.first_name} {reservation.last_name}</h5>
        <h6 className='card-subtitle mb-2 text-muted'>{reservation.mobile_number}</h6>
        <p className='card-text'>Date: {reservation.reservation_date}</p>
        <p className='card-text'>Time: {reservation.reservation_time}</p>
        <p className='card-text'>Party Size: {reservation.people}</p>
        <p className='card-text'>Status: {reservation.status}</p>
        <p className='card-text'>Reservation ID: {reservation.reservation_id}</p>
      </div>
    </div>
  );
};

export default DisplayReservation;