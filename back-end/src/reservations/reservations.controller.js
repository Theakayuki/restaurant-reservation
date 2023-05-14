/**
 * List handler for reservation resources
 */
const services = require('./reservations.services');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');
const hasProps = require('../util/hasProp');

// helper functions

const today = Date.now();
const UTC = (date) => {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  );
};

const isPast = (date) => date <= today;
const isTuesday = (date) => date.getDay() === 2;
const validDate = /\d{4}-\d{2}-\d{2}/;
const validTime = /\d{2}:\d{2}/;
const validStatus = ['booked', 'seated', 'finished', 'cancelled'];
const requiredProperties = [
  'first_name',
  'last_name',
  'mobile_number',
  'reservation_date',
  'reservation_time',
  'people',
];

// middleware

function hasData(req, res, next) {
  if (req.body.data) {
    res.locals.data = req.body.data;
    return next();
  }
  next({ status: 400, message: 'Body must have data property' });
}

const hasRequiredProperties = hasProps(requiredProperties);

function validateCapacity(req, res, next) {
  const { data = {} } = res.locals;
  const people = data.people;
  if (!Number.isInteger(people)) {
    return next({
      status: 400,
      message: 'The people field must be a number.',
    });
  }
  if (+people < 1) {
    return next({
      status: 400,
      message: 'The reservation must be for at least 1 person.',
    });
  }
  next();
}

function validateDateFormat(req, res, next) {
  const { data = {} } = res.locals;
  const reservation_date = data.reservation_date;
  if (!validDate.test(reservation_date)) {
    return next({
      status: 400,
      message: 'The reservation_date field must be a valid date.',
    });
  }
  next();
}

function validateTimeFormat(req, res, next) {
  const { data = {} } = res.locals;
  const reservation_time = data.reservation_time;
  if (!validTime.test(reservation_time)) {
    return next({
      status: 400,
      message: 'The reservation_time field must be a valid time.',
    });
  }
  next();
}

function validateDateTime(req, res, next) {
  const { data = {} } = res.locals;
  const { reservation_date, reservation_time } = data;
  const reservation = new Date(`${reservation_date}T${reservation_time}`);

  const dateUTC = Date.UTC(
    reservation.getUTCFullYear(),
    reservation.getUTCMonth(),
    reservation.getUTCDate(),
    reservation.getUTCHours(),
    reservation.getUTCMinutes(),
    reservation.getUTCSeconds(),
  );

  if (isPast(dateUTC)) {
    return next({
      status: 400,
      message: 'The reservation must be in the future.',
    });
  }
  if (isTuesday(reservation)) {
    return next({
      status: 400,
      message: 'The restaurant is closed on Tuesdays.',
    });
  }
  // check if reservation is before 10:30am
  const open = new Date(`${reservation_date}T10:30`);
  const openUTC = UTC(open);
  if (dateUTC < openUTC) {
    return next({
      status: 400,
      message: 'The reservation must be after 10:30am.',
    });
  }

  // check if reservation is after 9:30pm
  const close = new Date(`${reservation_date}T21:30`);
  const closeUTC = UTC(close);
  if (dateUTC > closeUTC) {
    return next({
      status: 400,
      message: 'The reservation must be before 9:30pm.',
    });
  }
  next();
}

async function validateReservationExists(req, res, next) {
  const { reservation_id } = req.params;
  const reservation = await services.read(reservation_id);
  if (!reservation) {
    return next({
      status: 404,
      message: `Reservation ${reservation_id} cannot be found.`,
    });
  }
  res.locals.reservation = reservation;
  next();
}

function validateBookedStatus(req, res, next) {
  const { data = {} } = res.locals;
  const status = data.status;
  if (status) {
  if (status === 'seated' || status === 'finished' || status === 'cancelled') {
    return next({
      status: 400,
      message: `Cannot create a reservation with a status of ${status}.`,
    });
  }
  }
  
  next();
}

function validateStatus(req, res, next) {
  const { data = {} } = res.locals;
  const status = data.status;
  if (!status || !validStatus.includes(status)) {
    return next({
      status: 400,
      message: `The status must be booked, seated, finished, or cancelled. Not: ${status}`,
    });
  }
  next();
}

function validateReservationUpdatable(req, res, next) {
  const { reservation } = res.locals;
  if (reservation.status === 'finished') {
    return next({
      status: 400,
      message: 'A finished reservation cannot be updated.',
    });
  }
  if (reservation.status === 'cancelled') {
    return next({
      status: 400,
      message: 'A cancelled reservation cannot be updated.',
    });
  }
  next();
}

function validateTableIdExists(req, res, next) {
  const { data = {} } = res.locals;
  const table_id = data.table_id;
  if (!table_id) {
    return next({
      status: 400,
      message: 'The table_id field is required.',
    });
  }
  next();
}

// CRUD functions

async function list(req, res) {
  const { date, mobile_number } = req.query;
  if (date) {
    const data = await services.listByDate(date);
    res.json({ data });
  } else if (mobile_number) {
    const data = await services.search(mobile_number);
    res.json({ data });
  } else {
    const data = await services.list();
    res.json({ data });
  }
}

async function create(req, res) {
  const data = await services.create(res.locals.data);
  res.status(201).json({ data });
}

async function read(req, res) {
  const { reservation } = res.locals;
  res.json({ data: reservation });
}

async function update(req, res) {
  const { reservation_id } = req.params;
  const response = await services.update(res.locals.data, reservation_id);
  const data = {
    first_name: response.first_name,
    last_name: response.last_name,
    mobile_number: response.mobile_number,
    people: response.people,
  };
  res.json({ data });
}

async function updateStatus(req, res) {
  const { reservation_id } = res.locals.reservation;
  const { status } = res.locals.data;
  const data = await services.updateStatus(reservation_id, status);
  res.status(200).json({ data });
}

async function seat(req, res) {
  const { reservation_id } = res.locals.reservation;
  const { table_id } = res.locals.data;
  const data = await services.seat(reservation_id, table_id);
  res.json({ data });
}

async function finish(req, res) {
  const { reservation_id } = res.locals.reservation;
  const { table_id } = res.locals.data;
  const data = await services.finish(reservation_id, table_id);
  res.json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasData,
    hasRequiredProperties,
    validateCapacity,
    validateDateFormat,
    validateTimeFormat,
    validateDateTime,
    validateBookedStatus,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(validateReservationExists), read],
  update: [
    asyncErrorBoundary(validateReservationExists),
    hasData,
    hasRequiredProperties,
    validateCapacity,
    validateDateFormat,
    validateTimeFormat,
    validateDateTime,
    validateReservationUpdatable,
    asyncErrorBoundary(update),
  ],
  updateStatus: [
    asyncErrorBoundary(validateReservationExists),
    hasData,
    validateStatus,
    validateReservationUpdatable,
    asyncErrorBoundary(updateStatus),
  ],
  seat: [
    asyncErrorBoundary(validateReservationExists),
    hasData,
    hasProps(['table_id']),
    validateTableIdExists,
    asyncErrorBoundary(seat),
  ],
  finish: [
    asyncErrorBoundary(validateReservationExists),
    hasData,
    hasProps(['table_id']),
    validateTableIdExists,
    asyncErrorBoundary(finish),
  ],
};
