import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import classnames from "classnames";

export default class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
      errors: {}
    };
  }

  componentDidMount() {
    console.log(`Login component mounted:`);
  }

  onChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  onSubmit(event) {
    event.preventDefault();
    const user = {
      email: this.state.email,
      password: this.state.password
    };

    let errors = {};
    let isLoginLegit = true;
    if (!this.state.email) {
      isLoginLegit = false;
      errors.email = "Please provide your email.";
    }
    if (!this.state.password) {
      isLoginLegit = false;
      errors.password = "Please provide your password.";
    }

    // Call backend API

    this.setState({ errors });

    if (isLoginLegit) {
      window.alert("Login successfull. User: " + JSON.stringify(user));
      this.props.onLoginClick(event, user);
    }
  }

  render() {
    if (this.props.isAuthorized) return <Redirect to="/" />;

    const { errors } = this.state;
    return (
      <div className="login h-100 m-4">
        <div className="container-fluid h-100">
          <div className="row h-100">
            <div className="col-md-8 m-auto">
              <h1 className="display-4 text-center">Log In</h1>
              <p className="lead text-center">
                Log in to your AVL Traffic account
              </p>
              <form onSubmit={e => this.onSubmit(e)}>
                <div className="form-group">
                  <input
                    type="email"
                    className={classnames("form-control form-control-lg", {
                      "is-invalid": errors.email
                    })}
                    placeholder="Email Address"
                    name="email"
                    value={this.state.email}
                    onChange={e => this.onChange(e)}
                  />
                  {errors.email && (
                    <div className="invalid-feedback ml-1">
                      Please provide your email.
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    className={classnames("form-control form-control-lg", {
                      "is-invalid": errors.password
                    })}
                    placeholder="Password"
                    name="password"
                    value={this.state.password}
                    onChange={e => this.onChange(e)}
                  />
                  {errors.password && (
                    <div className="invalid-feedback ml-1">
                      Please provide your password.
                    </div>
                  )}
                </div>
                <input type="submit" className="btn btn-info btn-block mt-4" />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  onLoginClick: PropTypes.func
};