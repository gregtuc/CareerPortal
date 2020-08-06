import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import '../Style/Signup.css';

export default class SignupPage extends Component {
  state = {
    username: null,
    firstName: null,
    lastName: null,
    email: null,
    password: null,
    missingValues: false,
  };

  signup = () => {
    this.props.handleSignup(this.state);
  };

  render() {
    return (
      <Fragment>
        {this.props.loggedIn && !this.props.signupError && (
          <Redirect to='/addAvatar' />
        )}
        <div className='pageBlocks'>
          <div className='rightBlock'>
            <div className='formCenter'>
              <div className='formTitle'>
                <h3>Sign Up</h3>
              </div>
              {this.props.signupError && (
                <div>
                  <p style={{ color: 'red' }}>There was an error signing up.</p>
                </div>
              )}
              <div className='formField'>
                <label className='formLabel'>Username</label>
                <input
                  className='formInput'
                  type='text'
                  id='username'
                  placeholder='Enter a username'
                  onBlur={(e) => this.setState({ username: e.target.value })}
                />
              </div>
              <div className='formField'>
                <label className='formLabel'>First Name</label>
                <input
                  className='formInput'
                  type='text'
                  id='firstName'
                  placeholder='Enter your first name'
                  onBlur={(e) => this.setState({ firstName: e.target.value })}
                />
              </div>
              <div className='formField'>
                <label className='formLabel'>Last Name</label>
                <input
                  className='formInput'
                  type='text'
                  id='lastName'
                  placeholder='Enter your last name'
                  onBlur={(e) => this.setState({ lastName: e.target.value })}
                />
              </div>
              <div className='formField'>
                <label className='formLabel'>Email address</label>
                <input
                  className='formInput'
                  type='email'
                  id='emailAddress'
                  placeholder='Enter your email address'
                  onBlur={(e) => this.setState({ email: e.target.value })}
                />
              </div>
              <div className='formField'>
                <label className='formLabel'>Password</label>
                <input
                  className='formInput'
                  type='password'
                  id='password'
                  placeholder='Enter a password'
                  onBlur={(e) => this.setState({ password: e.target.value })}
                />
              </div>

              <div className='buttonField'>
                <button className='formButton' onClick={this.signup}>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
