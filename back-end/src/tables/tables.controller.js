const services = require('./tables.services');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');
const hasProps = require('../util/hasProp');
const reservationsServices = require('../reservations/reservations.services');

// helper functions

function isValidTable(table) {
  const { table_name, capacity } = table;
  if (!table_name || !capacity) return false;
  if (table_name.length < 2) return false;
  if (!isCapacityNumber(table)) return false;
  if (!isValidCapacity(table)) return false;
  return true;
}

function isValidCapacity(table) {
  const { capacity } = table;
  if (+capacity < 1) return false;
  return true;
}

function isCapacityNumber(table) {
  if (typeof table.capacity !== 'number') return false;
  return true;
}

// validation middleware

function hasData(req, res, next) {
  if (req.body.data) {
    res.locals.data = req.body.data;
    return next();
  }
  next({ status: 400, message: 'Body must have data property' });
}

function hasValidProperties(req, res, next) {
  const { data = {} } = res.locals;
  if (!isValidTable(data)) {
    return next({
      status: 400,
      message: 'The table must include a table_name and capacity.',
    });
  }

  if (data.table_name.length < 2) {
    return next({
      status: 400,
      message: 'The table_name must be at least 2 characters long.',
    });
  }

  if (!isCapacityNumber(data)) {
    return next({
      status: 400,
      message: 'The table capacity must be a number.',
    });
  }

  if (!isValidCapacity(data)) {
    return next({
      status: 400,
      message: 'The table capacity must be at least 1.',
    });
  }
  return next();
}

function hasValidId(req, res, next) {
  const { table_id } = req.params;
  if (!table_id || table_id < 0 || !Number.isInteger(+table_id)) {
    return next({
      status: 400,
      message: `The table_id must be a positive integer: ${table_id}`,
    });
  }
  return next();
}

async function tableExists(req, res, next) {
  const { table_id } = req.params;
  const table = await services.read(table_id);
  if (!table) {
    return next({
      status: 404,
      message: `Table ${table_id} cannot be found.`,
    });
  }
  res.locals.table = table;
  return next();
}

async function reservationExists(req, res, next) {
  const { reservation_id } = res.locals.data;
  const reservation = await reservationsServices.read(reservation_id);
  if (!reservation) {
    return next({
      status: 404,
      message: `Reservation ${reservation_id} cannot be found.`,
    });
  }
  res.locals.reservation = reservation;
  return next();
}

function tableHasRoom(req, res, next) {
  const { table, reservation } = res.locals;
  if (table.capacity < reservation.people) {
    return next({
      status: 400,
      message: `Table ${table.table_id} has only capacity for ${table.capacity} not ${reservation.people} people.`,
    });
  }
  return next();
}

function isReservationSeated(req, res, next) {
  const { status } = res.locals.reservation;
  if (status === 'seated') {
    return next({
      status: 400,
      message: `Reservation ${res.locals.reservation.reservation_id} is already seated.`,
    });
  }
  return next();
}

function isTableOccupied(req, res, next) {
  const { table } = res.locals;
  if (table.reservation_id) {
    return next({
      status: 400,
      message: `Table ${table.table_id} is occupied.`,
    });
  }
  return next();
}

function tableIsFree(req, res, next) {
  const { table } = res.locals;
  if (!table.reservation_id) {
    return next({
      status: 400,
      message: `Table ${table.table_id} is not occupied.`,
    });
  }

  return next();
}


// CRUD Logic

async function list(req, res) {
  const data = await services.list();
  res.json({ data });
}

async function create(req, res) {
  const data = await services.create(res.locals.data);
  res.status(201).json({ data });
}

async function update(req, res) {
  const { table_id } = req.params;
  const data = await services.update(table_id, res.locals.data);
  res.json({ data });
}

async function destroy(req, res) {
  const { table_id } = req.params;
  await services.destroy(table_id);
  res.sendStatus(204);
}

async function seat(req, res) {
  const table = res.locals.table;
  const reservation = res.locals.reservation;
  const seatedTable = {
    ...table,
    reservation_id: reservation.reservation_id,
  }
  await reservationsServices.updateStatus(reservation.reservation_id, 'seated');
  const data = await services.update(seatedTable);
  res.status(200).json({ data });
}

async function finish(req, res) {
  const table = res.locals.table;
  const cleanTable = {
    ...table,
    reservation_id: null,
  }
  await reservationsServices.updateStatus(table.reservation_id, 'finished');
  const data = await services.update(cleanTable);
  res.status(200).json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasData,
    hasProps(['table_name', 'capacity']),
    hasValidProperties,
    asyncErrorBoundary(create),
  ],
  update: [
    asyncErrorBoundary(hasValidId),
    hasData,
    hasProps(['reservation_id']),
    hasValidProperties,
    asyncErrorBoundary(update),
  ],
  destroy: [asyncErrorBoundary(hasValidId), asyncErrorBoundary(destroy)],
  seat: [
    hasData,
    hasProps(['reservation_id']),
    asyncErrorBoundary(tableExists),
    asyncErrorBoundary(reservationExists),
    isReservationSeated,
    tableHasRoom,
    isTableOccupied,
    asyncErrorBoundary(seat),
  ],
  finish: [
    asyncErrorBoundary(tableExists),
    tableIsFree,
    asyncErrorBoundary(finish),
  ],
};
