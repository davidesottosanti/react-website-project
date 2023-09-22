import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Container, Button, Alert } from 'react-bootstrap'; // importo componenti react che mi servono
import { useEffect, useState } from 'react'; //Abilitare gli stati
import { BrowserRouter as Router, Route, Switch, Redirect, Link } from 'react-router-dom'; //abilitare react-router
import API from './API';
import { LoginForm } from './MyLogin.js'; //importo componenti custom fatti da me
import { MyMemePreview } from './MyMemePreview.js';
import { MyMemeFull } from './MyMemeFull.js';
import { MyMemeCreator } from './MyMemeCreator.js';


function App() {
  //STATES for data
  const [loginresult, setLoginresult] = useState(''); // It contains logged user info
  const [patterns, setPatterns] = useState([]); // It contains all patterns (text positions)
  const [memes, setMemes] = useState([]); // It contains all meme
  //STATES for loading and errors 
  const [loggedIn, setLoggedIn] = useState(false); // TRUE if a user is logged-in
  const [loading, setLoading] = useState(true); // TRUE if memes are downloading from server
  const [dirty, setDirty] = useState(true); // TRUE if a new meme is submitted
  const [error, setError] = useState(''); // Error messages


  //CHECK LOGGED USER (executed one time after first rendering)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getUserInfo();
        //executed if user logged
        setLoggedIn(true);
        setLoginresult(user);
      } catch (err) {//executed if user not logged
        setLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  //DOWNLOAD PATTERNS (executed one time after first rendering)
  useEffect(() => {
    const getAllPatterns = () => {
      API.getAllPatterns().then((patterns) => {
        setPatterns(patterns);
      }).catch((err) => {
        setError("Error downloading Patterns");
        setDirty(false);
        setLoading(false); //stop loading
      });
    }
      
    getAllPatterns();
  }, []);

  //DOWNLOAD MEMES (executed after first rendering, and if dirty===true & patterns are downloaded)
  useEffect(() => {
    const getAllMemes = () => {
      API.getAllMemes().then((memes) => {
        setMemes(memes);
        setDirty(false);
        setLoading(false); //stop loading
      }).catch((err) => {
        setError("Error downloading Meme");
        setDirty(false);
        setLoading(false); //stop loading
      });
    }
    
    if ((patterns.length!==0 && dirty)) {
      getAllMemes();
    }

  }, [patterns.length, dirty]);

  //REMOVE A MEME
  const deleteMeme = async (meme_id) => {
    //Set the meme (with meme_id) as temporary
    setMemes(oldMemes => {
      return oldMemes.map( (meme)=> {
        if(meme['id']===meme_id){
          return {...meme, status:"temporary"};
        }else{
          return meme;
        }
      });
    });

    //Delete meme (with meme_id) from DB
    try{
        await API.deleteMeme(meme_id);
        setDirty(true);
    }catch(err){
        setError('Error during meme elimination');
    }
  }

  //ADD A MEME
  const addMeme = async (new_meme) =>{
    //Add a new meme as temporary
    new_meme['status'] = "temporary";
    setMemes(oldMemes =>  [...oldMemes, new_meme]);

    //Add a new meme from DB
    try {
      await API.addMeme(new_meme);
      setDirty(true);
    } catch (err) {
      setDirty(true);
      setError("Error adding a new meme");
    }
  }

  //LOGOUT
  const doLogOut = async () => {
    await API.logOut();
    //Clean states
    setMemes([]);
    setLoginresult('');
    setLoggedIn(false);
    setDirty(true);
    setLoading(true);
  }


  return (<>
    <Router>
      <Container fluid className="App">
        <Switch>

          <Route exact path="/"//--------------------- HOME ROUTE -------------------------
            render={() => {
              let user_id;
              if (!loggedIn){ user_id="Guest" } else { user_id=parseInt(loginresult.id)}
              
              return (
                <>
                  {/*LOGIN HEADER*/}
                  <div className="mt-3">
                    {loggedIn? 
                       /*logged*/ 
                    <>
                      <label>Welcome <b style={{ color: 'dodgerblue' }}>{loginresult.name}</b></label>
                      <Link className="mx-2 pl-2" to={{pathname: "/memecreator"}}>
                        <Button variant="success">New Meme</Button>
                      </Link>
                      <Button className="mx-2" variant="outline-primary" onClick={doLogOut}>Logout</Button>
                    </>
                    :
                      /*not-logged*/
                    <>
                      <label className="mx-4">Welcome <b>[Guest]</b></label>
                      <Link to={'/login'}><Button>Login</Button></Link>
                    </>
                    }
                    
                  </div>

                  {/*ERROR MESSAGE*/}
                  {error !== "" ?
                    <Alert style={{ width: "60%"}} className="my-2 ml-auto mr-auto" variant={'danger'} onClose={() => setError("")} dismissible>
                        {error}
                    </Alert>: ''}

                  {/*MEME LIST*/}
                  <div className="pt-5 pb-2"><h4> Memes List </h4></div>

                  {loading ? 
                    <div>⌛ Loading memes, please wait..</div>
                  :memes.map((meme,index) => {
                    let matched_pattern;
                    for(let pattern of patterns){
                      if(parseInt(pattern['patternid_and_imagename']) === parseInt(meme['patternid'])){matched_pattern=pattern; break;}
                    }

                    return (
                    <MyMemePreview loggedIn={loggedIn} user_id={user_id} meme={meme} pattern={matched_pattern} 
                                       deleteMeme={deleteMeme} key={index}></MyMemePreview>
                      )
                  })
                  }

                </>
              );
            }}
          />

          <Route path="/memecreator"//--------------------- MEME-CREATOR (New Meme) ROUTE -------------------------
            render={() => {
              if (!loggedIn || patterns.length===0 || dirty) return (<Redirect to="/" />)/*page loaded by [Guests] or before memes are loaded or while memes are changing*/ 
              if (loggedIn && patterns.length!==0 && !dirty) return ( /*page loaded using the button and after memes are loaded*/
                <>
                  <MyMemeCreator patterns={patterns} setDirty={setDirty} addMeme={addMeme}></MyMemeCreator>
                </>);
            }}
          />
  
          <Route path="/memecopy"//--------------------- MEME-CREATOR (Copy Meme) ROUTE -------------------------
            render={({ location }) => {
              if (!loggedIn || patterns.length===0 || memes.length===0 || dirty || location.state===undefined) {return (<Redirect to="/" />);} /*page loaded by [Guests] or before memes are loaded or after meme are changed*/ 
              if (loggedIn && patterns.length!==0 && memes.length!==0 && !dirty && location.state!==undefined) return ( /*page loaded using the button and after memes are loaded*/
                <>
                  <MyMemeCreator meme={location.state.meme} pattern={location.state.pattern} user_id={loginresult.id} setDirty={setDirty} addMeme={addMeme}></MyMemeCreator>
                </>);
            }}
          />

          <Route path="/memeinfo"//--------------------- MEME-INFO ROUTE -------------------------
            render={({ location }) => {
              if (patterns.length===0 || memes.length===0 || location.state===undefined) return (<Redirect to="/" />) /*page loaded before memes are loaded or without using the button*/ 
              if (patterns.length!==0 && memes.length!==0 && location.state!==undefined) return( /*page loaded using the button and after memes are loaded*/
                <>
                  <MyMemeFull meme={location.state.meme} pattern={location.state.pattern}></MyMemeFull>
                </>);
            }}
          />

          <Route path="/login"//--------------------- LOGIN ROUTE -------------------------
            render={() => {
              if (loggedIn) return (<Redirect to="/"/>); /*logged*/
              if (!loggedIn) return (<LoginForm setLoggedIn={setLoggedIn} setLoginresult={setLoginresult} setDirty={setDirty} setLoading={setLoading}></LoginForm>); /*not logged*/ 

            }}
          />

        </Switch>
      </Container>
    </Router>
  </>);
}

export default App;
