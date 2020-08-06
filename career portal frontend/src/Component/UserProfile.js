import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import Post from './Post';
import '../Style/UserProfile.css';
import axios from 'axios';
import blankPic from '../Picture/blank_profile.png';

class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      username: '',
      loggedIn: true,
      usernameId: -1,
      nbFollowers: 0,
      nbFollowing: 0,
      followed: false,
      profilePic: blankPic,
      followId: -1,
      posts: [],
    };
  }

  componentDidMount() {
    this.getUserProfile();
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.id !== prevProps.match.params.id) {
      this.getUserProfile();
    }
  }

  getUserProfile = () => {
    const profileId = this.props.match.params.id;
    this.setState({ profileId: profileId });
    axios
      .get('http://localhost:8000/insta/getUserProfile/', {
        headers: {
          Authorization: `JWT ${localStorage.getItem('token')}`,
        },
        params: {
          profile_id: profileId,
          current_user_id: this.props.userId,
        },
      })
      .then((res) => {
        const user = res.data;
        this.setState({
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          nbFollowers: user.following,
          nbFollowing: user.followers,
          followed: user.current_user_following_profile,
          followId: user.follow_id,
          posts: user.posts,
          profilePic: user.avatar,
        });
      });
  };

  getStyle = () => {
    return {
      background: '#282c34',
      minHeight: '100vh',
      width: '100%',
      paddingTop: '5%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'calc(10px + 2vmin)',
      color: 'white',
      zIndex: '-1',
    };
  };

  followUser = () => {
    //    Write action to follow the user and set this.set.followed to true
    let formData = new FormData();
    formData.append('follower', this.props.userId);
    formData.append('following', this.props.match.params.id);
    let url = 'http://localhost:8000/insta/following/';
    axios
      .post(url, formData, {
        headers: {
          Authorization: `JWT ${localStorage.getItem('token')}`,
          'content-type': 'application/json',
        },
      })
      .then((res) => {
        this.setState((prevState) => ({
          followed: !prevState.followed,
          nbFollowing: prevState.nbFollowing + 1,
          followId: res.data.id,
        }));
      })
      .catch((err) => console.log(err));
  };

  unfollowUser = () => {
    if (this.state.followId !== -1) {
      axios
        .delete(
          `http://localhost:8000/insta/following/${this.state.followId}`,
          {
            headers: {
              Authorization: `JWT ${localStorage.getItem('token')}`,
            },
          }
        )
        .then((res) => {
          this.setState((prevState) => ({
            followed: !prevState.followed,
            nbFollowing: prevState.nbFollowing - 1,
          }));
        });
    }
  };

  render() {
    return (
      <div className='User'>
        {this.state.loggedIn ? (
          <Container>
            <Row>
              <Col className='User-info'>
                <div>
                  <a>
                    <img
                      src={this.state.profilePic}
                      alt='Profile_Pic.png'
                      className='Profile-pic'
                    />
                  </a>
                  <h3> {`${this.state.firstName} ${this.state.lastName}`}</h3>
                  <h6>
                    <b>{`@${this.state.username}`}</b>
                  </h6>
                  <span className='Follow-number'>
                    {this.state.nbFollowers}
                  </span>{' '}
                  following
                  <br />
                  <span className='Follow-number'>
                    {this.state.nbFollowing}
                  </span>{' '}
                  followers
                  <br />
                  {this.state.followed ? (
                    <button onClick={this.unfollowUser}>Unfollow</button>
                  ) : (
                    <button onClick={this.followUser}>Follow</button>
                  )}
                </div>
              </Col>
            </Row>
            {this.state.posts.length > 0 ? (
              <Col>
                <br />
                {this.state.posts.map((post) => {
                  return (
                    <div key={post.id} className='Posts'>
                      <Post
                        username={this.props.username}
                        userId={this.props.userId}
                        postUserId={post.userId}
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
              </Col>
            ) : (
              <Col md={{ size: 10, offset: 1 }} className='profile_grid'>
                <h3>Upload your first picture</h3>
              </Col>
            )}
          </Container>
        ) : (
          <Container>
            <h2 style={{ color: 'white' }}>Sorry, this user doesn't exist</h2>
          </Container>
        )}
      </div>
    );
  }
}

export default UserProfile;
