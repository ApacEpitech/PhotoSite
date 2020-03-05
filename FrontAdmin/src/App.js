import React from 'react';
import logo from './logo.svg';
import Button from 'antd/es/button';
import './App.css';
import Home from './Component/home';
import Login from './Component/login';
import Users from './Component/users';

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import HomeAdmin from "./Component/homeAdmin";

function App() {
  return (
      <Router>
      <Switch>
        <Route exact path="/home" component={Home}/>
        <Route exact path="/login" component={Login}/>
        <Route exact path="/" component={Login}/>
        <Route exact path="/users" component={Users}/>
        <Route exact path="/homeAdmin" component={HomeAdmin}/>
      </Switch>
      </Router>
  );
}

export default App;
