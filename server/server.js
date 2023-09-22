'use strict';
const morgan = require('morgan');       // LOGGING
const express = require('express');     // SERVER
const app = new express();                  // SERVER
const {check, validationResult} = require('express-validator'); // SERVER (VALIDATORI) (es: .isEmail())
const sqlite = require('sqlite3');      // DATABASE
app.use(morgan('dev'));                 // LOGGING
app.use(express.json());                // TRADUZIONE JSON (HTML)
const passport = require('passport');                     // AUTHENTICATION
const LocalStrategy = require('passport-local').Strategy; // AUTHENTICATION
const session = require('express-session');               // AUTHENTICATION
app.use(session({                            // AUTHENTICATION (secret)
    secret: 'a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());              // AUTHENTICATION (start session)
app.use(passport.session());                 // AUTHENTICATION (start session)
const dao_users = require('./dao-user');      // MY MODULE (dao-users)
const dao_meme = require('./dao-meme');       // MY MODULE (dao-users)

/*****************    Setup PASSPORT     *****************/

// [PASSPORT]: LOCAL STRATEGY
passport.use(new LocalStrategy(
    function (username, password, done) {
      dao_users.getUser(username, password).then((user)=>{//getUser usa USERNAME e PASSWORD per scaricare i dati dell'user dal DB e "salvarli in" passport
        if (!user) {return done(null, false, { message: 'Incorrect username and/or password.' });} //error
        return done(null, user); //success
      })
    }
  ));

// [PASSPORT]: SERIALIZE (user-id -> session-id)
passport.serializeUser((user, done) => { done(null, user.id); });

// [PASSPORT]: DE-SERIALIZE (session-id -> user-id)
passport.deserializeUser((id, done) => {
  dao_users.getUserById(id)
    .then(user => {
      done(null, user);
    }).catch(err => {
      done(err, null);
    });
});

// [PASSPORT]: CUSTOM-MIDDLEWARE (already logged?)
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'not authenticated' });
}


/*****************    Meme APIs     *****************/

// GET /api/meme
app.get('/api/memes', (req, res) => {
  let isCreator=0;
  
  if (req.isAuthenticated()){isCreator=1;}
  dao_meme.getAllMemes(isCreator)
    //.then(memes => setTimeout(()=>res.json(memes),1000)) //slow down 5s
    .then(memes => res.json(memes))
    .catch(() => res.status(500).end());
});

// GET /api/patterns
app.get('/api/patterns', (req, res) => {
  dao_meme.getAllPatterns()
    .then(patterns => res.json(patterns))
    .catch(() => res.status(500).end());
});

// POST /api/meme
app.post('/api/memes', isLoggedIn, [
  check('patternid').isInt({ min: 0, max:5 }),//it checks the image exists in the range 0-5
  check('title').isLength({ min:1, max: 100 }),//it checks the title exists and it doesn't overflow
  check('text').custom((textballoons)=>{//it checks if there is at least 1 balloon
    if(textballoons.split(";").some(  (textballoon)=>{ 
          
        if(textballoon!==""){return true;} else {return false;}

      })===false 
    || textballoons.split(";").length > 3 /*check number of balloons*/){
      //using promise in order to handle the error in the "if" below
      return Promise.reject("Invalid Text Balloon");
    }else{
      return Promise.resolve()
    }
  }).custom((textballoons)=>{//it checks if all balloons are < 48 characters long
    if(textballoons.split(";").some(  (textballoon)=>{ 
      
        if(textballoon.length > 70) return true; else return false;

      }) ===true){
        return Promise.reject("Invalid Text Balloon Length");
      }else{
        return Promise.resolve()
      }
    }),
  check('font').isAlpha().isLength({min:1, max:10}),//it checks if the font exists and it's a word
  check('color').isAlpha().isLength({min:1, max:10}),//it checks if the color exists and it's a word
  check('protected').isBoolean()//it checks if the privacy level exixts and is boolean
], async (req, res) => {
  //check errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //console.log(errors);
    return res.status(422).json({errors: errors.array()});
  }

  const meme = {
    title: req.body.title,
    patternid: req.body.patternid,
    text: req.body.text,
    font: req.body.font,
    color: req.body.color,
    creator_id: req.user.id,
    creator_name: req.user.name,
    protected: req.body.protected
  };
  
  try {
    await dao_meme.addMeme(meme);
    res.status(201).end();
  } catch(err) {
    res.status(503).json({error: `Database error during the creation of a new Meme.`});
  }
});

// DELETE /api/meme
app.delete('/api/memes/:id', isLoggedIn, 
[check('id').isInt()],
async (req, res) => {
  try{
    await dao_meme.deleteMeme(req.params.id);
    res.status(200).json({});
  }catch(err){
    res.status(503).json({ error: `Database error during the deletion of Meme ${req.params.id}` });
  }
});


/*****************    Users APIs     *****************/

// POST /api/sessions   [LOGIN]
app.post('/api/sessions', [
      check('username').isEmail().isLength({ min:1, max:50 }),
      check('password').isLength({ min:6, max:50 })
    ],function (req, res, next) {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({errors: errors.array()});
        }
        
        passport.authenticate('local', (err, user, info) => {
          if (err) { return next(err); } // LocalStrategy error
          if (!user) { return res.status(401).json(info); } // auth failure
      
          req.login(user, (err) => { // opening session
            if (err) { return next(err); } // opening-session error
            return res.json(req.user); // req.user contiene tutte le info dell'utente autenticato
          });
      
        })(req, res, next); // custom auth callback
    });

// DELETE /api/sessions  [LOGOUT]
app.delete('/api/sessions/current', (req, res) => {
  req.logout();
  res.end();
});

// GET  /api/sessions/current  [CHECK LOGGED USER]
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Unauthenticated user!'});;
});

/*****************    START SERVER     *****************/
app.listen(3001);