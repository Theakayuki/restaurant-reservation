import { useHistory } from "react-router-dom";
import { finishTable } from "../utils/api";

const TableDisplay = ({ table }) => {
  const history = useHistory();
  function finishHandler({ target: { dataset: {
    tableIdFinish,
    reservationIdFinish,
  }}}) {
    const abortController = new AbortController();
    if (

      window.confirm(
        "Is this table ready to seat new guests? This cannot be undone."
      )
    ) {
      finishTable(tableIdFinish, reservationIdFinish, abortController.signal);
      history.go();
    }
  }

    
  return (
    <div className='m-3 text-center'>
      <div className='card'>
        <div className='card-body'>
          <h5 className='card-title'>Table Name: {table.table_name}</h5>
          <p className='card-text'>Capacity: {table.capacity}</p>
          <p className='card-text' data-table-id-status={table.table_id}>
            Status: {table.reservation_id ? 'Occupied' : 'Free'}
          </p>
          {table.reservation_id ? (
            <button
              className='btn btn-secondary m-1'
              data-table-id-finish={table.table_id}
              data-reservation-id-finish={table.reservation_id}
              onClick={finishHandler}
            >
              Finish
            </button>
          ) : ''}
        </div>
      </div>
    </div>
  );
};

export default TableDisplay;
