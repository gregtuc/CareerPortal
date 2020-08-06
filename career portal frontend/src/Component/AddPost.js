import React, { Component, Fragment } from 'react';
import axios from 'axios';
import '../Style/Signup.css';
import { Redirect } from 'react-router-dom';

class AddPost extends Component {
  state = {
    content: '',
    image: null,
    postCreated: false,
  };

  handleChange = (e) => {
    this.setState({
      [e.target.id]: e.target.value,
    });
  };

  handleImageChange = (e) => {
    this.setState({
      image: e.target.files[0],
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    let formData = new FormData();
    formData.append('image', this.state.image, this.state.image.name);
    formData.append('user', this.props.userId);
    formData.append('description', this.state.content);
    let url = 'http://localhost:8000/insta/posts/';
    axios
      .post(url, formData, {
        headers: {
          Authorization: `JWT ${localStorage.getItem('token')}`,
          'content-type': 'multipart/form-data',
        },
      })
      .then(() => {
        this.setState({ postCreated: true });
      });
  };

  render() {
    return (
      <Fragment>
        {this.state.postCreated && <Redirect to='/' />}
        <div className='pageBlocksAddPost'>
          <div className='rightBlock'>
            <div className='formCenterAddPost'>
              <div className='formTitle'>
                <h3>Add a Post!</h3>
              </div>
              <div className='formField'>
                <label className='formLabel'>Description</label>
                <input
                  className='formInput'
                  value={this.state.content}
                  type='text'
                  id='content'
                  placeholder='Description...'
                  onChange={this.handleChange}
                  required
                />
              </div>
              <div className='formField'>
                <label className='formLabel'>Select a Picture</label>
                <input
                  className='formInput'
                  type='file'
                  accept='image/png, image/jpeg'
                  id='image'
                  onChange={this.handleImageChange}
                  required
                />
              </div>

              <div className='buttonField'>
                <button className='formButton' onClick={this.handleSubmit}>
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default AddPost;
