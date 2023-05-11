/**
 * List handler for reservation resources
 */
const services = require('./reservations.services');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

// helper functions
const today = new Date();
const isPast = (date) => date < today;
const isTuesday = (date) => date.getDay() === 2;

function isValidPhoneNumber(phoneNumber) {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phoneNumber);
}

function formatPhoneNumber(phoneNumber) {
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return match[1] + '-' + match[2] + '-' + match[3];
  }
  return null;
}

function isValidDate(date) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
}

function isValidTime(time) {
  const timeRegex = /^\d{2}:\d{2}$/;
  return timeRegex.test(time);
}

// validation middleware

function hasData(req, res, next) {
  if (req.body.data) {
    res.locals.data = req.body.data;
    return next();
  }
  next({ status: 400, message: 'Body must have data property' });
}

function hasProperties(...properties) {
  return function (req, res, next) {
    const { data = {} } = res.locals;
    try {
      properties.forEach((property) => {
        const value = data[property];
        if (!value) {
          const error = new Error(`A '${property}' property is required.`);
          error.status = 400;
          throw error;
        }
      });
      return next();
    } catch (error) {
      next(error);
    }
  };
}

function dateValid(req, res, next) {
  const { reservation_date, reservation_time } = res.locals.data;

  if (!isValidDate(reservation_date)) {
    return next({
      status: 400,
      message: `reservation_date is not a valid date: ${reservation_date}`,
    });
  }

  const date = new Date(reservation_date);
  if (isPast(date)) {
    return next({
      status: 400,
      message: `reservation_date must be a future date: ${reservation_date}`,
    });
  }

  if (isTuesday(date)) {
    return next({
      status: 400,
      message: `The restaurant is closed on Tuesdays. Please choose a different day.`,
    });
  }

  if (!isValidTime(reservation_time)) {
    return next({
      status: 400,
      message: `reservation_time is not a valid time: ${reservation_time}`,
    });
  }

  next();
}

function validPhoneNumber(req, res, next) {
  const { mobile_number } = res.locals.data;
  if (!isValidPhoneNumber(mobile_number)) {
    return next({
      status: 400,
      message: `mobile_number is not a valid phone number: ${mobile_number}`,
    });
  }
  const formattedPhoneNumber = formatPhoneNumber(mobile_number);
  if (formatPhoneNumber) {
    res.locals.data.mobile_number = formattedPhoneNumber;
  }

  next();
}

// route handlers

async function list(req, res) {
  const { date } = req.query;
  const data = await services.list(date);
  res.json({
    data,
  });
}

async function create(req, res) {
  const data = await services.create(res.locals.data);
  res.status(201).json({
    data,
  });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasData,
    hasProperties('first_name', 'last_name', 'mobile_number', 'reservation_date', 'reservation_time', 'people'),
    dateValid,
    validPhoneNumber,
    asyncErrorBoundary(create),
  ],
};
