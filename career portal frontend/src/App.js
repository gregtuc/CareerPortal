import React, { Component } from 'react';
import './Style/App.css';
import Header from './Component/Header';
import Home from './Component/Home';
import Explore from './Component/Explore';
import AddPost from './Component/AddPost';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import Login from './Component/Login';
import Signup from './Component/Signup';
import AddAvatar from './Component/AddAvatar';
import axios from 'axios';
import UserProfile from './Component/UserProfile';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: localStorage.getItem('token') ? true : false,
      username: '',
      usernameId: -1,
      loginError: false,
      signupError: false,
      addAvatarError: false,
      avatarAdded: false,
      userList: [],
      avatar: null,
    };
  }

  componentDidMount() {
    this.loadFeed();
    this.getAllUsers();
  }

  getAllUsers = () => {
    if (this.state.loggedIn) {
      axios
        .get('http://localhost:8000/insta/user/', {
          headers: {
            Authorization: `JWT ${localStorage.getItem('token')}`,
          },
        })
        .then((res) => {
          const userList = [];
          for (let index in res.data.results) {
            const user = {
              username: res.data.results[index].username,
              userId: res.data.results[index].id,
            };
            userList.push(user);
          }
          this.setState({
            userList: userList,
          });
        });
    }
  };

  loadFeed = () => {
    if (this.state.loggedIn) {
      fetch('http://localhost:8000/insta/current_user/', {
        headers: {
          Authorization: `JWT ${localStorage.getItem('token')}`,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          this.setState({
            username: json.username,
            usernameId: json.id,
            avatar: json.avatar,
          });
        });
    }
  };

  handleLogin = (e, data) => {
    e.preventDefault();
    axios({
      method: 'post',
      url: 'http://localhost:8000/token-auth/',
      data,
    })
      .then((e) => {
        localStorage.setItem('token', e.data.token);
        this.setState({
          loggedIn: true,
          username: e.data.user.username,
          usernameId: e.data.user.id,
          loginError: false,
        });
        this.loadFeed();
      })
      .catch((e) => {
        if (e.response.status === 400 && e.response.data.non_field_errors) {
          this.setState({
            loginError: true,
          });
        }
      });
  };

  handleSignup = (data) => {
    if (
      data.username &&
      data.firstName &&
      data.lastName &&
      data.email &&
      data.password
    ) {
      const backendData = {
        username: data.username,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
      };
      axios
        .post('http://localhost:8000/insta/users/', backendData)
        .then((res) => {
          localStorage.setItem('token', res.data.token);
          this.setState({
            loggedIn: true,
            username: res.data.username,
            usernameId: res.data.id,
            signupError: false,
          });
        })
        .catch((err) => {
          this.setState({
            signupError: true,
          });
        });
    } else {
      this.setState({
        signupError: true,
      });
    }
  };

  handleCreateProfile = (data) => {
    if (this.state.usernameId && data.selectedFile && data.selectedFile.name) {
      let formData = new FormData();
      formData.append('user', this.state.usernameId);
      formData.append('avatar', data.selectedFile, data.selectedFile.name);
      let url = 'http://127.0.0.1:8000/insta/profiles/';
      axios
        .post(url, formData, {
          headers: {
            Authorization: `JWT ${localStorage.getItem('token')}`,
            'content-type': 'multipart/form-data',
          },
        })
        .then((res) => {
          this.setState({
            addAvatarError: false,
            avatarAdded: true,
          });
          this.loadFeed();
        })
        .catch((err) => {
          this.setState({
            addAvatarError: true,
            avatarAdded: false,
          });
        });
    } else {
      this.setState({
        addAvatarError: true,
        avatarAdded: false,
      });
    }
  };

  handleLogout = () => {
    localStorage.removeItem('token');
    this.setState({
      loggedIn: false,
      username: '',
      posts: [],
      usernameId: -1,
      avatar: null,
      avatarAdded: false,
    });
  };

  render() {
    return (
      <Router>
        <div>
          {this.state.loggedIn && this.state.avatarAdded && <Redirect to='/' />}
          <Header
            title='Instagram'
            loggedIn={this.state.loggedIn}
            handleLogout={this.handleLogout}
            userList={this.state.userList}
            usernameId={this.state.usernameId}
            avatar={this.state.avatar}
          />
          <Route
            exact
            path='/'
            render={() => (
              <Home
                loggedIn={this.state.loggedIn}
                username={this.state.username}
                usernameId={this.state.usernameId}
                loggedInUserAvatar={this.state.avatar}
              />
            )}
          />
          <Route
            exact
            path='/add'
            render={() => (
              <AddPost
                loggedIn={this.state.loggedIn}
                userId={this.state.usernameId}
              />
            )}
          />
          <Route
            exact
            path='/login'
            render={() => (
              <Login
                handleLogin={this.handleLogin}
                isLoggedIn={this.state.loggedIn}
                loginError={this.state.loginError}
              />
            )}
          />
          <Route
            exact
            path='/signup'
            render={() => (
              <Signup
                handleSignup={this.handleSignup}
                signupError={this.state.signupError}
                loggedIn={this.state.loggedIn ? true : false}
              />
            )}
          />
          <Route
            exact
            path='/profile/:id'
            render={(props) => (
              <UserProfile
                {...props}
                username={this.state.username}
                loggedIn={this.state.loggedIn}
                userId={this.state.usernameId}
                loggedInUserAvatar={this.state.avatar}
              />
            )}
          />
          <Route
            exact
            path='/addAvatar'
            render={() => (
              <AddAvatar
                handleCreateProfile={this.handleCreateProfile}
                addAvatarError={this.state.addAvatarError}
                avatarAdded={this.state.avatarAdded}
              />
            )}
          />
          <Route
            exact
            path='/explore'
            render={() => (
              <Explore
                loggedIn={this.state.loggedIn}
                username={this.state.username}
                usernameId={this.state.usernameId}
                loggedInUserAvatar={this.state.avatar}
              />
            )}
          />
        </div>
      </Router>
    );
  }
}

export default App;
