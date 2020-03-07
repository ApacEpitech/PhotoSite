import React from 'react';
import './App.css';
import Home from './Component/home';
import Login from './Component/login';
import Users from './Component/users';

import {
    BrowserRouter as Router,
    Switch,
    Route
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
