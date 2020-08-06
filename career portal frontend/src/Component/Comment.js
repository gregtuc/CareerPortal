import React, { Component } from 'react';
import ProfilePic from '../Picture/blank_profile.png';
import axios from 'axios';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import '../Style/Post.css';

class Comment extends Component {
  state = {
    username: null,
  };

  componentDidMount() {
    //This variable is snake_case as it comes from the backend
    axios
      .get(`http://localhost:8000/insta/user/${this.props.comment.user_id}`, {
        headers: {
          Authorization: `JWT ${localStorage.getItem('token')}`,
        },
      })
      .then((res) => {
        this.setState({
          username: res.data.username,
        });
      });
  }

  componentDidUpdate(prevProps) {
    //This variable is snake_case as it comes from the backend
    if (this.props.comment !== prevProps.comment) {
      axios
        .get(`http://localhost:8000/insta/user/${this.props.comment.user_id}`, {
          headers: {
            Authorization: `JWT ${localStorage.getItem('token')}`,
          },
        })
        .then((res) => {
          this.setState({
            username: res.data.username,
          });
        });
    }
  }

  render() {
    return (
      <Paper elevation={3} className='Comment'>
        <Grid container direction='row' alignItems='center' spacing={1}>
          <Grid item>
            <Avatar
              src={this.props.comment.avatar || ProfilePic}
              alt='profile'
            />
          </Grid>
          <Grid item>
            <span style={{ fontWeight: 'bold' }}>
              {this.state.username || 'User'}:
            </span>
          </Grid>
          <Grid item>
            <span>{this.props.comment.comment}</span>
          </Grid>
        </Grid>
      </Paper>
    );
  }
}

export default Comment;
