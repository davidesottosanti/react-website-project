/*****************    Meme API     *****************/
async function getAllMemes() {
  const response = await fetch('/api/memes');
  const memes = await response.json();
  if (response.ok) {
    return memes;
  } else {
    throw memes;
  }
}

async function getAllPatterns() {
  const response = await fetch('/api/patterns');
  const patterns = await response.json();
  if (response.ok) {
    return patterns;
  } else {
    throw patterns;
  }
}

function addMeme(meme) {
  return new Promise((resolve, reject) => {
    fetch('/api/memes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meme),
      }).then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
    }).catch(() => { reject({ error: "Cannot receive server response." }) }); // connection errors
  });
}

function deleteMeme(id) {
  return new Promise((resolve, reject) => {
    fetch('/api/memes/'+ id, {
      method: 'DELETE'
      }).then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          // analyze the cause of error
          response.json()
            .then((message) => { reject(message); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

/*****************    Login API     *****************/
async function logIn(credentials) {
    let response = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (response.ok) {
      const user = await response.json();
      return user; //ritorna info del DB ad APP.js
    } else {
      try {
        const errDetail = await response.json();
        throw errDetail.message;
      } catch (err) { throw err; }
    }
  }
  
  async function logOut() {
    await fetch('/api/sessions/current', { method: 'DELETE' });
  }
  
  async function getUserInfo() {
    const response = await fetch('/api/sessions/current');
    const userInfo = await response.json();
    if (response.ok) {
      return userInfo;
    } else {
      throw userInfo;
    }
  }
  
  
  const API = { logIn, logOut, getUserInfo, getAllMemes, getAllPatterns, addMeme, deleteMeme }; //creo oggetto con dentro le funzioni per le API
  export default API;