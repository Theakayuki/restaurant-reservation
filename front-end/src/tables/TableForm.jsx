import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import ErrorAlert from '../layout/ErrorAlert';
import { createTable } from '../utils/api';

function TableForm({ submitForm }) {
  const [form, setForm] = useState({ table_name: '', capacity: '' });
  const [errors, setErrors] = useState(null);
  const history = useHistory();

  function handleChange({ target }) {
    setForm({
      ...form,
      [target.name]: target.value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const abortController = new AbortController();
    const errors = validateTable();
    //format the data
    form.capacity = Number(form.capacity);
    setErrors(errors);
    if (!errors) {
      createTable(form, abortController.signal)
        .then(submitForm)
        .then(() => history.push('/dashboard'))
        .catch(setErrors);
    }
    return () => abortController.abort();
  }

  function validateTable() {
    const capacity = Number(form.capacity);

    if (capacity < 1 || !Number.isInteger(capacity)) {
      return 'Capacity must be a at least 1 person.';
    }

    if (form.table_name.length < 2) {
      return 'Table name must be at least 2 characters long.';
    }

    

    return null;
  }

  return (
    <main className='min-vh-md-100'>
      <div className='ms-3'>
        <h4 className='mt-5'>New Table</h4>
        <ErrorAlert error={errors} />
        <form onSubmit={handleSubmit} className='row g-3'>
          <div className='form-group'>
            <div className='form-floating col-6 mb-3'>
              <input
                id='table_name'
                name='table_name'
                type='text'
                className='form-control mt-3'
                placeholder='Table Name'
                onChange={handleChange}
                value={form.table_name}
                required
              />
              <label htmlFor='table_name'>Table Name</label>
            </div>

            <div className='form-floating col-6'>
              <input
                id='capacity'
                name='capacity'
                type='number'
                className='form-control'
                placeholder='Capacity'
                onChange={handleChange}
                value={form.capacity}
                required
              />
              <label htmlFor='capacity'>Capacity</label>
            </div>

            <div className='form-group mt-3'>
              <button
                type='button'
                className='btn btn-secondary me-2'
                onClick={() => history.goBack()}
              >
                Cancel
              </button>
              <button type='submit' className='btn btn-primary m-1'>
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

export default TableForm;
