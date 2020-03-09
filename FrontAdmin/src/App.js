import React from 'react';
import './App.css';
import Login from './Component/login/login';
import Home from './Component/homeAdmin/homeAdmin';
import Users from './Component/users';
import { toast } from 'react-toastify';

import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

toast.configure();

function App() {
  return (
      <Router>
      <Switch>
        <Route exact path="/login" component={Login}/>
        <Route exact path="/" component={Login}/>
        <Route exact path="/users" component={Users}/>
        <Route exact path="/homeAdmin" component={Home}/>
      </Switch>
      </Router>
  );
}

export default App;
