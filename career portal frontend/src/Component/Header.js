import React from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { Navbar, NavbarBrand, Nav, NavItem } from 'reactstrap';
import '../Style/Header.css';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Avatar from '@material-ui/core/Avatar';

class Header extends React.Component {
  handleSearchSelect = (value) => <Redirect to={`/profile/${value}`} />;

  getUserUrl = (username) => {
    return '/users/' + username;
  };

  render() {
    if (this.props.isLoggedIn && !this.props.username) {
      this.props.refresh_user();
    }
    return (
      <div className='App-header'>
        <Navbar light expand='md'>
          <NavbarBrand href='/' style={{ flexGrow: 1 }}>
            <div>
              <i className='Header-title' style={{ fontSize: '20px' }}>
                {this.props.title}
              </i>
            </div>
          </NavbarBrand>
          {this.props.userList != null && this.props.loggedIn && (
            <div style={{ flexGrow: 1 , display: 'flex', justifyContent: 'center' }}>
            <Autocomplete
              onChange={(event, value) =>
                value
                  ? this.props.history.push(`/profile/${value.userId}`)
                  : null
              }
              id='combo-box-demo'
              options={this.props.userList}
              getOptionLabel={(option) => option.username}
              style={{ width: 300, backgroundColor: 'white' }}
              renderInput={(params) => (
                <TextField {...params} label='Users' variant='filled' />
              )}
            />
            </div>
          )}
          <Nav className='ml-auto' navbar style={{ flexGrow: '1', justifyContent: 'center' }}>
            {!this.props.loggedIn ? (
              <div>
                <NavItem className='Button-nav'>
                  <Link to='/login'>
                    <button className='Header-button'>Login</button>
                  </Link>
                </NavItem>
                <NavItem className='Button-nav'>
                  <Link to='/signup'>
                    <button className='Header-button'>Sign Up</button>
                  </Link>
                </NavItem>
              </div>
            ) : (
              <div className="Header-items">
                <NavItem className='Button-nav'>
                  <Link to='/explore'>
                    <button className='Header-button'>Explore</button>
                  </Link>
                </NavItem>
                <NavItem className='Button-nav'>
                  <Link to='/add'>
                    <button className='Header-button'>Add Post</button>
                  </Link>
                </NavItem>
                <NavItem className='Button-nav'>
                  <Link to='/'>
                    <button
                      className='Header-button'
                      onClick={this.props.handleLogout}
                    >
                      Log Out
                    </button>
                  </Link>
                </NavItem>
                <NavItem className='Profile-position'>
                  <Link to={`/profile/${this.props.usernameId}`}>
                    <Avatar
                      src={this.props.avatar}
                      className='Profile-picture'
                    />
                  </Link>
                </NavItem>
              </div>
            )}
          </Nav>
        </Navbar>
      </div>
    );
  }
}

export default withRouter(Header);
