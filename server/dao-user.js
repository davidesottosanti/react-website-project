'use strict';
const db = require("./db");       // MY db
const bcrypt = require('bcrypt'); // AUTHENTICATION


// Ritorna info utente LOGGATO sapendo: il suo ID
exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM Users WHERE id = ?';
        db.get(sql, [id], (err, row) => {
            if (err)
                reject(err);
            else if (row === undefined)
                resolve({ error: 'User not found.' });
            else {
                // Local Strategy si aspetta la proprietà "username" nell'oggetto che ritorniamo
                const user = { id: row.id, username: row.email, name: row.name}
                resolve(user);
            }
        });
    });
};

// Ritorna info utente NON LOGGATO sapendo: username e password
exports.getUser = (email, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM Users WHERE email = ?';
        db.get(sql, [email], (err, row) => {
            if (err)
                reject(err);
            else if (row === undefined) {
                resolve(false);
            }
            else {
                const user = { id: row.id, username: row.email, name: row.name};
                // check the hashes with an async call, given that the operation may be CPU-intensive (and we don't want to block the server)
                bcrypt.compare(password, row.password).then(result => {
                    if (result)
                        resolve(user);
                    else
                        resolve(false);
                });
            }
        });
    });
};