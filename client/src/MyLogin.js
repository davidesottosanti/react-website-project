import { Form, Button, Alert,  Row } from 'react-bootstrap';
import { Link } from 'react-router-dom'; //abilitare react-router
import { useState } from 'react';
import API from './API';

function LoginForm(props) {
  const [username, setUsername] = useState('aldo@polito.it');   //useState('giovanni@polito.it');  //useState('giacomo@polito.it');
  const [password, setPassword] = useState('password11');       //useState('password22');          //useState('password33');
  const [error, setError] = useState('');

  const doLogIn = async (credentials) => {
    try {
      let user = await API.logIn(credentials); //Send credentials, get USERNAME only
      props.setLoginresult(user);
      props.setLoggedIn(true);
      props.setDirty(true);
      props.setLoading(true);
    }catch(err){
      setError("Invalid credentials");
    }
  }

  const handleSubmit = (event) => {
      setError(''); //error reset
      const credentials = { username: username, password: password };
      
      let valid = true;
      if(username === '' || password === '' || username.length > 50 || password.length < 6 || password.length > 50){ valid = false; }
      
      if(valid){
        doLogIn(credentials);
      }else {
        setError('Input not valid. Username/password are too long/short');
      }
  };

  return (
    <Form className="mx-5 my-5">
      <h1>Login</h1>
      <Form.Group as={Row} controlId='formBasicEmail'>
          <Form.Label>Email</Form.Label>
          <Form.Control type='email' placeholder="Enter email" value={username} onChange={ev => setUsername(ev.target.value)} />
      </Form.Group>

      <Form.Group as={Row} controlId='formBasicPassword'>
          <Form.Label>Password</Form.Label>
          <Form.Control type='password' placeholder="Enter password" value={password} onChange={ev => setPassword(ev.target.value)} />
      </Form.Group>

      {error !=='' ? <Alert className="my-3" variant='danger'>ERR: {error}</Alert> : ''}
      <div > <Button onClick={handleSubmit}>Login</Button> <Link to="/"> <Button variant="outline-primary">Back</Button></Link></div>
    </Form>)
}

export { LoginForm };