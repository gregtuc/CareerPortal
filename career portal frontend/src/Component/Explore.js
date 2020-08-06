import React, { Component } from 'react';
import axios from 'axios';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import '../Style/Explore.css';

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
        .get('http://127.0.0.1:8000/insta/posts/', {
          headers: {
            Authorization: `JWT ${localStorage.getItem('token')}`,
          },
        })
        .then((res) => {
          this.setState({
            posts: res.data.reverse(),
          });
        });
    }
  }

  render() {
    return (
      <div className='App-home'>
        <div className='feed'>
          <GridList cellHeight={350} className='gridList' cols={3}>
            {this.state.posts.map((post) => (
              <GridListTile key={post.id}>
                <img src={post.image} alt={post.username} />
                <GridListTileBar
                  title={post.username}
                  subtitle={<span>{post.description}</span>}
                />
              </GridListTile>
            ))}
          </GridList>
        </div>
      </div>
    );
  }
}
