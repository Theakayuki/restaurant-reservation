import React from "react";
import { useHistory } from "react-router-dom";
import { createReservation } from "../utils/api";
import ClientForm from "./ClientForm";

function NewReservation(){
const history = useHistory();

const handleSubmit = (data) => {
  createReservation(data)
    .then(() => history.push(`/dashboard?date=${data.reservation_date}`))
    .catch((error) => console.log(error));
};

return (
  <div>
    <h1>New Reservation</h1>
    <ClientForm submitHandler={handleSubmit} />
  </div>
);
}

export default NewReservation;