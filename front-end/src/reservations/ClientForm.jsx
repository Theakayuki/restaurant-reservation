const { useState } = require('react');
const { useHistory } = require('react-router-dom');

function ClientForm({
  submitHandler,
  initialValues = {
    first_name: '',
    last_name: '',
    mobile_number: '',
    reservation_date: '',
    reservation_time: '',
    people: '',
  },
}) {
  const [formData, setFormData] = useState(initialValues);
  const history = useHistory();

  function changeHandler({ target: { name, value } }) {
    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function formSubmitHandler(event) {
    event.preventDefault();
    const form = event.target;
    const data = {
      first_name: form.first_name.value,
      last_name: form.last_name.value,
      mobile_number: form.mobile_number.value,
      reservation_date: form.reservation_date.value,
      reservation_time: form.reservation_time.value,
      people: form.people.value,
    };
    submitHandler(data);
  }

  function cancelHandler() {
    history.goBack();
  }

  return (
    <form onSubmit={formSubmitHandler}>
      <div className='form-group row content-center'>
        <div className='form-floating col-6 mb-3'>
          <input
            className='form-control'
            id='first_name'
            type='text'
            name='first_name'
            onChange={changeHandler}
            value={formData.first_name}
            required={true}
          />
          <label htmlFor='first_name'>First Name:</label>
        </div>

        <div className='form-floating col-6'>
          <input
            className='form-control'
            id='last_name'
            type='text'
            name='last_name'
            onChange={changeHandler}
            value={formData.last_name}
            required={true}
          />
          <label htmlFor='last_name'>Last Name:</label>
        </div>

        <div className='form-floating col-12 mb-3'>
          <input
            className='form-control'
            id='mobile_number'
            type='tel'
            name='mobile_number'
            onChange={changeHandler}
            value={formData.mobile_number}
            min={10}
            max={10}
            required={true}
          />
          <label htmlFor='mobile_number'>Mobile Number:</label>
        </div>

        <div className='form-floating col-6 mb-3'>
          <input
            className='form-control'
            id='reservation_date'
            type='date'
            name='reservation_date'
            onChange={changeHandler}
            pattern='\d{4}-\d{2}-\d{2}'
            value={formData.reservation_date}
            required={true}
          />
          <label htmlFor='reservation_date'>Reservation Date:</label>
        </div>

        <div className='form-floating col-6'>
          <input
            className='form-control'
            id='reservation_time'
            type='time'
            name='reservation_time'
            onChange={changeHandler}
            value={formData.reservation_time}
            pattern='\d{2}:\d{2}:\d{2}'
            required={true}
          />
          <label htmlFor='reservation_time'>Reservation Time:</label>
        </div>

        <div className='form-floating col-6 mb-3'>
          <input
            className='form-control'
            id='people'
            type='number'
            name='people'
            onChange={changeHandler}
            value={formData.people}
            min='1'
            required={true}
          />
          <label htmlFor='people'>Party Size:</label>
        </div>
        <div className='form-group'>
          <button type='submit' className='btn btn-primary me-4'>
            Submit
          </button>
          <button type='button' className='btn btn-secondary' onClick={cancelHandler}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

export default ClientForm;
