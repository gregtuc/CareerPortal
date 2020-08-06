import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { BrowserRouter as Router } from 'react-router-dom';

import Post from './Component/Post';
import Header from './Component/Header';
import Comment from './Component/Comment';

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

//Post Component Tests

it('post renders with a username', () => {
  act(() => {
    render(
      <Router>
        <Post postUsername='Will' />
      </Router>,
      container
    );
  });
  expect(container.textContent).toEqual(expect.stringContaining('Will'));

  act(() => {
    render(
      <Router>
        <Post postUsername='Matt' />
      </Router>,
      container
    );
  });
  expect(container.textContent).toEqual(expect.stringContaining('Matt'));
});

it('post renders with a description', () => {
  act(() => {
    render(
      <Router>
        <Post uploadDesc='This is the description' />
      </Router>,
      container
    );
  });
  expect(container.textContent).toEqual(
    expect.stringContaining('This is the description')
  );

  act(() => {
    render(
      <Router>
        <Post uploadDesc='This is the description for this post' />
      </Router>,
      container
    );
  });
  expect(container.textContent).toEqual(
    expect.stringContaining('This is the description for this post')
  );
});

//Comment Component Tests

it('comment renders with correct comment', () => {
  act(() => {
    render(<Comment comment={{ comment: 'This is the comment' }} />, container);
  });
  expect(container.textContent).toEqual(
    expect.stringContaining('This is the comment')
  );

  act(() => {
    render(
      <Comment comment={{ comment: 'This is the second comment' }} />,
      container
    );
  });
  expect(container.textContent).toEqual(
    expect.stringContaining('This is the second comment')
  );
});

it('header renders with a title', () => {
  act(() => {
    render(
      <Router>
        <Header title='Instagram' />
      </Router>,
      container
    );
  });
  expect(container.textContent).toEqual(expect.stringContaining('Instagram'));

  act(() => {
    render(
      <Router>
        <Header title='Youtube' />
      </Router>,
      container
    );
  });
  expect(container.textContent).toEqual(expect.stringContaining('Youtube'));
});

it('header renders differently depending on logged in', () => {
  act(() => {
    render(
      <Router>
        <Header loggedIn={true} />
      </Router>,
      container
    );
  });
  expect(container.textContent).toEqual(expect.stringContaining('Log Out'));

  act(() => {
    render(
      <Router>
        <Header loggedIn={false} />
      </Router>,
      container
    );
  });
  expect(container.textContent).toEqual(expect.stringContaining('Login'));
});
