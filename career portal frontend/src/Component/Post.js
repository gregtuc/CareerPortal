import React, { Component } from 'react';
import blank from '../Picture/blankPic.png';
import Comment from './Comment';
import axios from 'axios';
import '../Style/Post.css';
import ProfilePic from '../Picture/blank_profile.png';
import { Link } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Avatar from '@material-ui/core/Avatar';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import Grid from '@material-ui/core/Grid';

class Post extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pic: blank,
      desc: '(none)',
      comment: '',
      comments: [],
      expanded: false,
      username: '',
      profilePic: ProfilePic,
    };
    this.getAllComments();

    this.onHandleChange = this.onHandleChange.bind(this);
    this.handleAddComment = this.handleAddComment.bind(this);
    this.handleExpandComments = this.handleExpandComments.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    return { pic: props.uploadPic, desc: props.uploadDesc };
  }

  getAllComments() {
    axios
      .get('http://localhost:8000/insta/comments/', {
        headers: {
          Authorization: `JWT ${localStorage.getItem('token')}`,
        },
        params: {
          postId: this.props.postId,
        },
      })
      .then((res) => {
        this.setState({
          comments: res.data,
        });
      });
  }

  handleAddComment(event) {
    event.preventDefault();
    let data = new FormData();
    data.append('comment', this.state.comment);
    data.append('user', this.props.userId);
    data.append('post', this.props.postId);
    axios
      .post('http://localhost:8000/insta/comments/', data, {
        headers: {
          Authorization: `JWT ${localStorage.getItem('token')}`,
          'content-type': 'application/json',
        },
      })
      .catch((err) => {
        console.log(err, 'Axios error');
      });

    // These variables are snakecase as they simulate a response from the backend
    const newComment = {
      id: -1,
      comment: this.state.comment,
      date_comment: -1,
      user_id: this.props.userId,
      post_id: this.props.postId,
      avatar: this.props.loggedInUserAvatar,
    };
    this.setState((prevState) => ({
      comment: '',
      comments: prevState.comments.concat(newComment),
    }));
  }

  onHandleChange(e) {
    this.setState({
      comment: e.target.value,
    });
  }

  handleExpandComments(e) {
    e.preventDefault();
    this.setState((prevState) => ({
      expanded: !prevState.expanded,
    }));
  }

  getCommentArray() {
    const comments =
      this.state.comments.length === 0 ? null : this.state.expanded ? (
        this.state.comments.map((c) => {
          return (
            <Comment key={c.id} comment={c} username={this.props.username} />
          );
        })
      ) : (
        <Comment
          comment={this.state.comments[this.state.comments.length - 1]}
          postUserId={this.props.postUserId}
        />
      );
    return comments;
  }

  render() {
    const comments = this.getCommentArray();
    const commentbutton = this.state.expanded ? (
      <IconButton
        onClick={this.handleExpandComments}
        aria-label='View'
        size='small'
      >
        <ArrowUpwardIcon fontSize='inherit' />{' '}
      </IconButton>
    ) : (
      <IconButton
        onClick={this.handleExpandComments}
        aria-label='View'
        size='small'
      >
        <ArrowDownwardIcon fontSize='inherit' />
      </IconButton>
    );
    return (
      <Card className='Post' elevation={3} width='300'>
        <CardActionArea>
          <CardMedia
            component='img'
            alt='Image'
            height='300'
            image={this.state.pic}
            title='Image'
          />
        </CardActionArea>
        <CardContent>
          <Link to={`/profile/${this.props.postUserId}`}>
            <Typography gutterBottom variant='h4' component='h2'>
              <Grid container direction='row' alignItems='center'>
                <Grid item>
                  <Avatar
                    src={this.props.postAvatar || this.state.profilePic}
                    alt='profile'
                  />
                </Grid>
                <Grid item>{this.props.postUsername}</Grid>
              </Grid>
            </Typography>
          </Link>
          <Typography variant='h5' color='textPrimary' component='p'>
            {this.state.desc}
          </Typography>
          {comments && (
            <Typography
              gutterBottom
              variant='h6'
              color='textSecondary'
              component='h2'
            >
              Comments {commentbutton}{' '}
            </Typography>
          )}
          {comments}
          <form>
            <TextField
              className='Post-comment'
              id='add-comment'
              label='Comment'
              placeholder='...'
              multiline
              variant='outlined'
              onChange={this.onHandleChange}
              value={this.state.comment}
            />
            <br />
            <div className='Send-button'>
              <Button
                variant='contained'
                color='primary'
                onClick={this.handleAddComment}
                endIcon={<Icon>send</Icon>}
              >
                Send
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }
}

export default Post;
