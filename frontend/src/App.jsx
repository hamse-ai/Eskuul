import React from 'react'
import axios from 'axios'
import { useState, useEffect} from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Await
} from 'react-router-dom'


import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar'
// import Home from './pages/Home';

import './index.css';


axios.defaults.withCredentials = true;

function App() {

  const [user, setUser] = useState(null); 
  
  
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/auth/me');
        console.log(res);
        setUser(res.data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchUser();
  }, [])

  if (loading) {
    return <h1>Loading...</h1>
  }


  return (
    <Router >
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home user={user} error={error} />} />
        <Route path='/login' element={user ? <Navigate to="/" /> : <Login setUser={setUser} />}  />
        <Route path='/register' element={user ? <Navigate to="/" /> : <Register setUser={setUser} />}  />
      </Routes>
    </Router>
  )
}

export default App
