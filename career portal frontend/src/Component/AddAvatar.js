import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import '../Style/Signup.css';

export default class AddAvatar extends Component {
  state = {
    selectedFile: null,
  };

  fileSelectedHandler = (event) => {
    this.setState({
      selectedFile: event.target.files[0],
    });
  };

  createProfile = () => {
    this.props.handleCreateProfile(this.state);
  };

  render() {
    return (
      <Fragment>
        {this.props.avatarAdded && <Redirect to='/' />}
        <div className='pageBlocks'>
          <div className='rightBlock'>
            <div className='formCenter'>
              <div className='formTitle'>
                <h3>Sign Up</h3>
              </div>
              {this.props.addAvatarError && (
                <div>
                  <p style={{ color: 'red' }}>
                    There was an error adding an avatar.
                  </p>
                </div>
              )}
              <div className='formField'>
                <label className='formLabel'>Profile Picture</label>
                <input
                  className='formInput'
                  type='file'
                  id='profilePic'
                  placeholder='Browse files'
                  onChange={this.fileSelectedHandler}
                />
              </div>
              <div className='buttonField'>
                <button className='formButton' onClick={this.createProfile}>
                  Add avatar
                </button>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
