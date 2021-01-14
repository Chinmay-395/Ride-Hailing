import React, { useState } from 'react';
import axios from 'axios';
import { Button, Container, Form, Navbar, Nav } from 'react-bootstrap'; // new
import { LinkContainer } from 'react-router-bootstrap'; // new
import { Link, Redirect, Route, Switch } from 'react-router-dom'; // changed
import { ToastContainer } from 'react-toastify';
//component import
import SignUp from './components/SignUp'; // new
import LogIn from './components/LogIn'; // new
import Driver from './components/Driver.js';
import Rider from './components/Rider.js';
import { isDriver, isRider } from './services/AuthService';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// changed
function App() {
  const [isLoggedIn, setLoggedIn] = useState(() => {
    return window.localStorage.getItem('taxi.auth') !== null;
  });
  const logIn = async (username, password) => {
    const url = `${process.env.REACT_APP_BASE_URL}/api/log_in/`;
    try {
      const response = await axios.post(url, { username, password });
      window.localStorage.setItem(
        'taxi.auth', JSON.stringify(response.data)
      );
      setLoggedIn(true);
      return { response, isError: false };
    }
    catch (error) {
      console.error(error);
      return { response: error, isError: true };
    }
  };

  const logOut = () => {
    window.localStorage.removeItem('taxi.auth');
    setLoggedIn(false);
  };

  return (
    <>
      <Navbar bg='light' expand='lg' variant='light'>
        <LinkContainer to='/'>
          <Navbar.Brand className='logo'>Taxi</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle />
        <Navbar.Collapse>
          {
            isRider() && (
              <Nav className='mr-auto'>
                <LinkContainer to='/rider/request'>
                  <Nav.Link>Request a trip</Nav.Link>
                </LinkContainer>
              </Nav>
            )
          }
          {
            isLoggedIn && (
              <Form inline className='ml-auto'>
                <Button
                  type='button'
                  onClick={() => logOut()}
                >Log out</Button>
              </Form>
            )
          }
        </Navbar.Collapse>
      </Navbar>
      <Container className='pt-3'>
        <Switch>
          <Route exact path='/' render={() => (
            <div className='middle-center'>
              <h1 className='landing logo'>Taxi</h1>
              {
                !isLoggedIn &&
                <>
                  <Link
                    id='signUp'
                    className='btn btn-primary'
                    to='/sign-up'
                  >Sign up</Link>
                  <Link
                    id='logIn'
                    className='btn btn-primary'
                    to='/log-in'
                  >Log in</Link>
                </>
              }
              {
                isRider() && (
                  <Link
                    className='btn btn-primary'
                    to='/rider'
                  >Rider Dashboard</Link>
                )
              }
              {
                isDriver() && (
                  <Link
                    className='btn btn-primary'
                    to='/driver'
                  >Driver Dashboard</Link>
                )
              }
              <ToastContainer />
            </div>
          )} />
          <Route path='/sign-up' render={() => (
            isLoggedIn ? (
              <Redirect to='/' />
            ) : (
                <SignUp />
              )
          )} />
          <Route path='/log-in' render={() => (
            isLoggedIn ? (
              <Redirect to='/' />
            ) : (
                <LogIn logIn={logIn} />
              )
          )} />
          {/* The driver related components */}
          <Route path='/driver' render={() => (
            <Driver />
          )} />
          {/* The rider related compoenents */}
          <Route path='/rider' render={() => (
            <Rider />
          )} />
        </Switch>
      </Container>
    </>
  );
}

export default App;