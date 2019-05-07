import React, { Component } from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";

class Signup extends Component {
  constructor() {
    super();
    this.state = {
      name: "",
      email: "",
      password: "",
      password2: "",
      formSubmittedSuccessfully: false,
      errors: {}
    };
  }

  onChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  onSubmit(event) {
    event.preventDefault();

    const newUser = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2
    };

    console.log(`newUser: ${JSON.stringify(newUser)}`);

    let errors = {};
    let isFormLegit = true;
    if (!this.state.name) {
      errors.name = "Invalid name";
      isFormLegit = false;
    }
    if (!this.state.email) {
      errors.email = "Invalid email";
      isFormLegit = false;
    }
    if (!this.state.password) {
      errors.password = "Invalid password";
      isFormLegit = false;
    }
    if (!this.state.password2) {
      errors.password2 = "Invalid confirm password";
      isFormLegit = false;
    }
    if (this.state.password !== this.state.password2) {
      isFormLegit = false;
      errors.passwordMatch = "Passwords do not match!";
    }
    console.log(`Errors: ${JSON.stringify(errors)}`);

    this.setState({ errors, formSubmittedSuccessfully: isFormLegit });

    if (isFormLegit) {
      window.alert("Successfully signed up!");
      console.log("signed up");
      return;
    }
  }

  render() {
    if (this.state.formSubmittedSuccessfully) return <Redirect to="/login" />;

    const { errors } = this.state;
    console.log(`render got errors: ${JSON.stringify(errors)}`);
    return (
      <div className="signup">
        <div className="container">
          <div className="row">
            <div className="col-md-8 m-auto">
              <h1 className="display-4 text-center">Sign Up</h1>
              <p className="lead text-center">
                Create your AVL Traffic Layer account
              </p>
              <form onSubmit={e => this.onSubmit(e)}>
                <div className="form-group">
                  <input
                    type="text"
                    className={classnames("form-control form-control-lg", {
                      "is-invalid": errors.name
                    })}
                    placeholder="Name"
                    name="name"
                    value={this.state.name}
                    onChange={e => this.onChange(e)}
                  />
                  {errors.name && (
                    <div className="invalid-feedback ml-1">
                      Please provide a username.
                    </div>
                  )}
                </div>
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
                      Please provide your AVL email account.
                    </div>
                  )}
                  <small className="form-text text-muted ml-1">
                    This webservice is specifically built for AVL users. Please
                    use your AVL email account.
                  </small>
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    className={classnames("form-control form-control-lg", {
                      "is-invalid": errors.password || errors.passwordMatch
                    })}
                    placeholder="Password"
                    name="password"
                    value={this.state.password}
                    onChange={e => this.onChange(e)}
                  />
                  {errors.password && (
                    <div className="invalid-feedback ml-1">
                      Please provide a password.
                    </div>
                  )}
                  {errors.passwordMatch && (
                    <div className="invalid-feedback ml-1">
                      Passwords should match.
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    className={classnames("form-control form-control-lg", {
                      "is-invalid": errors.password2 || errors.passwordMatch
                    })}
                    placeholder="Confirm Password"
                    name="password2"
                    value={this.state.password2}
                    onChange={e => this.onChange(e)}
                  />
                  {errors.password2 && (
                    <div className="invalid-feedback ml-1">
                      Please provide a password.
                    </div>
                  )}
                  {errors.passwordMatch && (
                    <div className="invalid-feedback ml-1">
                      Passwords should match.
                    </div>
                  )}
                </div>
                <input
                  type="submit"
                  className="btn btn-info btn-block signup-btn"
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Signup.propTypes = {
  onSignupSubmitClick: PropTypes.func
};

export default Signup;
