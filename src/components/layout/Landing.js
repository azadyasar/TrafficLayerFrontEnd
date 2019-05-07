import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default class Landing extends Component {
  render() {
    console.log(`Rendering Landing isAuthorized:${this.props.isAuthorized}`);
    return (
      <div className="landing">
        <div className="dark-overlay landing-inner text-light">
          <div className="container">
            <div className="row">
              <div className="col-md-12 text-center">
                <h1 className="display-3 mb-4">AVL Traffic Layer</h1>
                <p className="lead">
                  {" "}
                  Designed to serve traffic related queries
                </p>
                <hr />
                <React.Fragment>
                  {!this.props.isAuthorized && (
                    <React.Fragment>
                      <Link to="/signup" className="btn btn-lg btn-info mr-2">
                        Sign Up
                      </Link>
                      <Link to="/login" className="btn btn-lg btn-light">
                        Login
                      </Link>
                    </React.Fragment>
                  )}
                </React.Fragment>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Landing.propTypes = {
  isAuthorized: PropTypes.bool.isRequired
};
