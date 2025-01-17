const tables = require('./01-tables.json');
// coped from existing seed file

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex
    .raw('TRUNCATE TABLE tables RESTART IDENTITY CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('tables').insert(tables);
    });
};
