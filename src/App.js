import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "../node_modules/mapbox-gl/src/css/mapbox-gl.css";
import "./App.css";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Landing from "./components/layout/Landing";
import Map from "./components/layout/Map";

import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";

class App extends Component {
  constructor() {
    super();
    this.state = {
      isAuthorized: false,
      showFooter: true
    };
  }

  componentDidMount() {
    console.log(`Route: ${window.location.pathname}`);
  }

  onLoginClick = event => {
    event.preventDefault();
    window.alert("Welcome");
    this.setState({
      isAuthorized: true
    });
  };

  onLogoutClick = event => {
    window.alert("Bye");
    this.setState({
      isAuthorized: false
    });
  };

  onSignupSubmitClick = event => {};

  render() {
    console.log(`Main App rendering again isAuth: ${this.state.isAuthorized}`);
    console.log(`pathname: ${window.location.pathname}`);
    return (
      <Router>
        <div className="App">
          <Route
            exact
            path="/"
            render={routeProps => {
              return (
                <React.Fragment>
                  <Navbar
                    isAuthorized={this.state.isAuthorized}
                    onLogoutClick={this.onLogoutClick}
                  />
                  <Landing
                    {...routeProps}
                    isAuthorized={this.state.isAuthorized}
                  />
                  <Footer />
                </React.Fragment>
              );
            }}
          />
          <div>
            <Route
              exact
              path="/signup"
              render={routeProps => {
                return (
                  <React.Fragment>
                    <Navbar
                      isAuthorized={this.state.isAuthorized}
                      onLogoutClick={this.onLogoutClick}
                    />
                    <Signup
                      {...routeProps}
                      onSignupSubmitClick={this.onSignupSubmitClick}
                    />
                    <Footer />
                  </React.Fragment>
                );
              }}
            />
            <Route
              exact
              path="/login"
              render={routeProps => {
                return (
                  <React.Fragment>
                    <Navbar
                      isAuthorized={this.state.isAuthorized}
                      onLogoutClick={this.onLogoutClick}
                    />
                    <Login
                      {...routeProps}
                      isAuthorized={this.state.isAuthorized}
                      onLoginClick={this.onLoginClick}
                      onLogoutClick={this.onLogoutClick}
                    />
                    <Footer />
                  </React.Fragment>
                );
              }}
            />
            <Route
              exact
              path="/map"
              render={routeProps => <Map {...routeProps} />}
            />
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
