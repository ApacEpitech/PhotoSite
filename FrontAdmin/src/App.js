import React from 'react';
import './App.css';
import Login from './Component/login';
import Home from './Component/homeAdmin';
import Users from './Component/users';
import Categories from './Component/categories';
import Destinations from './Component/destinations';
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
        <Route exact path="/photos" component={Home}/>
        <Route exact path="/categories" component={Categories}/>
        <Route exact path="/destination" component={Destinations}/>
      </Switch>
      </Router>
  );
}

export default App;
