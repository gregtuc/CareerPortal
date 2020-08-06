import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import MuiAlert from '@material-ui/lab/Alert';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

function Alert(props) {
  return <MuiAlert elevation={6} variant='filled' {...props} />;
}

class Login extends Component {
  state = {
    username: '',
    password: '',
  };

  handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState((prevState) => {
      const newState = { ...prevState };
      newState[name] = value;
      return newState;
    });
  };

  render() {
    return (
      <div className='App-home'>
        <Container component='main' maxWidth='xs'>
          <CssBaseline />
          <Fragment>
            <form onSubmit={(e) => this.props.handleLogin(e, this.state)}>
              <Paper elevation={3} className='App-login'>
                <TextField
                  variant='outlined'
                  margin='normal'
                  required
                  fullWidth
                  label='Username'
                  autoComplete='username'
                  autoFocus
                  name='username'
                  value={this.state.username}
                  onChange={this.handleChange}
                />
                <br />
                <br />
                <TextField
                  variant='outlined'
                  margin='normal'
                  required
                  fullWidth
                  name='password'
                  label='Password'
                  type='password'
                  id='password'
                  autoComplete='current-password'
                  value={this.state.password}
                  onChange={this.handleChange}
                />
                <Button
                  fullWidth
                  variant='contained'
                  color='primary'
                  type='submit'
                >
                  Sign In
                </Button>
              </Paper>
              <br />
              {this.props.loginError && (
                <Alert severity='error'>
                  The credentials you entered were invalid, please try again.
                </Alert>
              )}
            </form>
          </Fragment>
        </Container>
      </div>
    );
  }
}

export default Login;

Login.propTypes = {
  handleLogin: PropTypes.func.isRequired,
};
