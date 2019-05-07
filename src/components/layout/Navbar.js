import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class Navbar extends Component {
  render() {
    console.log("Rendering isLoggedIn: " + this.props.isAuthorized);

    const guestLinks = (
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <Link to="/" className="nav-link" onClick={this.props.onLogoutClick}>
            Logout
          </Link>
        </li>
      </ul>
    );

    const authLinks = (
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <Link className="nav-link" to="/signup">
            Sign Up
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className="nav-link"
            to={{
              pathname: "/login"
            }}
          >
            Login
          </Link>
        </li>
      </ul>
    );

    return (
      <nav className="navbar navbarcustom navbar-expand-sm navbar-dark bg-dark ">
        <Link className="navbar-brand-logo" to="/">
          <img src={require("../../img/avl.png")} alt="" />
        </Link>
        <div className="container">
          <Link className="navbar-brand" to="/">
            Home
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#mobile-nav"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="mobile-nav">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  History
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/map">
                  Map
                </Link>
              </li>
            </ul>
            {this.props.isAuthorized ? guestLinks : authLinks}
          </div>
        </div>
      </nav>
    );
  }
}