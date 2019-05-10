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
      errors: {},
      valids: {}
    };
  }

  onChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  // SHOULDO Move validation feedback to onChange?
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
    let valids = {};
    let isFormLegit = true;
    if (!this.state.name) {
      errors.name = "Invalid name";
      isFormLegit = false;
    } else {
      valids.name = "Valid name";
    }
    if (!this.state.email) {
      errors.email = "Invalid email";
      isFormLegit = false;
    } else {
      valids.email = "Valid email";
    }
    if (!this.state.password) {
      errors.password = "Invalid password";
      isFormLegit = false;
    } else {
      valids.password = "Valid password";
    }
    if (!this.state.password2) {
      errors.password2 = "Invalid confirm password";
      isFormLegit = false;
    } else {
      valids.password2 = "Valid password2";
    }
    if (this.state.password !== this.state.password2) {
      isFormLegit = false;
      errors.passwordMatch = "Passwords do not match!";
      valids.password = valids.password2 = null;
    }
    console.log(
      `Errors: ${JSON.stringify(errors)}, Valids: ${JSON.stringify(valids)}`
    );

    this.setState({ errors, valids, formSubmittedSuccessfully: isFormLegit });

    if (isFormLegit) {
      window.alert("Successfully signed up!");
      console.log("signed up");
      return;
    }
  }

  render() {
    if (this.state.formSubmittedSuccessfully) return <Redirect to="/login" />;

    const { errors, valids } = this.state;
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
                      "is-invalid": errors.name,
                      "is-valid": valids.name
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
                      "is-invalid": errors.email,
                      "is-valid": valids.email
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
                      "is-invalid": errors.password || errors.passwordMatch,
                      "is-valid": valids.password
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
                      "is-invalid": errors.password2 || errors.passwordMatch,
                      "is-valid": valids.password2
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
