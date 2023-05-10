/**
 * List handler for reservation resources
 */
const services = require('./reservations.services');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

// helper functions

function isValidPhoneNumber(number) {
  const phoneNumberRegex = /^\d{3}-\d{3}-\d{4}$/;
  if (correctPhoneLength(number)) {
    return phoneNumberRegex.test(number);
  }
  return false;
}

function correctPhoneLength(number) {
  return number.length === 10;
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
  if (correctPhoneLength(mobile_number)) {
    res.locals.data.mobile_number = `${mobile_number.slice(0, 3)}-${mobile_number.slice(
      3,
      6,
    )}-${mobile_number.slice(6)}`;
  }
  next();
}

// route handlers

async function list(req, res) {
  const date = req.query.date;
  if (date) {
    const dateData = await services.dateLookup(date);
    return res.json({
      data: dateData,
    });
  }
  const data = await services.list();
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
