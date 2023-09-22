'use strict';
const db = require("./db");        // MY db

// GET all memes from DB
exports.getAllMemes = (isCreator) => {
  if (isCreator === 0) {//utente non registrato (ottiene solo i meme pubblici)
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Memes WHERE protected = ?';
      db.all(sql, [0], (err, rows) => {
        if (err)
          reject(err);
        else {
          // Local Strategy si aspetta la proprietà "username" nell'oggetto che ritorniamo
          const memes = rows.map((row)=>({
            id: row.id,
            patternid: row.patternid,
            title: row.title,
            text: row.text,
            font: row.font,
            color: row.color,
            creator_id: row.creator_id,
            creator_name: row.creator_name,
            protected: row.protected===1? true: false
          }));

          resolve(memes);
        }
      });
    });

  } else if (isCreator === 1) {//utente creatore (ottiene tutti i meme)
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Memes';
      db.all(sql, (err, rows) => {
        if (err)
          reject(err);
        else {
          // Local Strategy si aspetta la proprietà "username" nell'oggetto che ritorniamo
          const memes = rows.map((row)=>({
            id: row.id,
            patternid: row.patternid,
            title: row.title,
            text: row.text,
            font: row.font,
            color: row.color,
            creator_id: row.creator_id,
            creator_name: row.creator_name,
            protected: row.protected===1? true: false
          }));
          
          resolve(memes);
        }
      });
    });
  }
};

// GET all patterns from DB
exports.getAllPatterns = (isCreator) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Patterns';
      db.all(sql, (err, rows) => {
        if (err)
          reject(err);
        else {
          // Local Strategy si aspetta la proprietà "username" nell'oggetto che ritorniamo
          const patterns = rows.map((row)=>({
            patternid_and_imagename: row.patternid_and_imagename,
            coordinates_preview: row.coordinates_preview,
            coordinates_full: row.coordinates_full,
          }));
          
          resolve(patterns);
        }
      });
    });
};

// ADD a new meme in DB
exports.addMeme = (meme) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO Memes(patternid,title,text,font,color,creator_id,creator_name,protected) VALUES(?,?,?,?,?,?,?,?)';
      db.run(sql, [meme.patternid, meme.title, meme.text, meme.font, meme.color, meme.creator_id, meme.creator_name, meme.protected], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);//lastID è il numero di riga inserita (se l'operazione è andata a buon fine)
      });
    });
  };
  
  //REMOVE an existing meme from DB
  exports.deleteMeme = (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM Memes WHERE id = ?';
      db.run(sql, [id], (err) => {
        if (err) {
          reject(err);
          return;
        }else{
          resolve(null);
        }
      });
    });
  }