'use strict';
const sqlite = require('sqlite3');
const db = new sqlite.Database('db.sqlite', (err) => {if (err) throw err;/*gestore errori*/});
module.exports = db;