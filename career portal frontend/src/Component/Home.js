import React, { Component } from 'react';
import Post from './Post';
import axios from 'axios';

export default class Home extends Component {
  state = {
    posts: [],
  };

  componentDidMount() {
    this.fetchPosts();
  }

  fetchPosts() {
    if (this.props.loggedIn) {
      axios
        .get('http://127.0.0.1:8000/insta/posts', {
          headers: {
            Authorization: `JWT ${localStorage.getItem('token')}`,
          },
          params: {
            user_id: this.props.usernameId,
          },
        })
        .then((res) => {
          this.setState({
            posts: res.data.reverse(),
          });
        });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.usernameId === -1 && this.props.usernameId !== -1) {
      this.fetchPosts();
    }
    if (prevProps.loggedIn !== this.props.loggedIn && !this.props.loggedIn) {
      this.setState({
        posts: [],
      });
    }
  }

  render() {
    return (
      <div className='App-home'>
        {this.state.posts.map((post) => {
          return (
            <div key={post.id} style={{ width: '46%', margin: '0% 0% 0% 20%' }}>
              <Post
                username={this.props.username}
                userId={this.props.usernameId}
                postUserId={post.user_id}
                postUsername={post.username}
                uploadPic={post.image}
                uploadDesc={post.description}
                postId={post.id}
                postAvatar={post.avatar}
                loggedInUserAvatar={this.props.loggedInUserAvatar}
              />
              <br />
            </div>
          );
        })}
      </div>
    );
  }
}
