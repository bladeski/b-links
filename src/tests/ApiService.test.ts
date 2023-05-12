import ApiService from '../scripts/services/ApiService';
import { BlogPostModel } from './../scripts/models/BlogPost.model';
import { LinkModel } from '../scripts/models';
import jestMockFetch from 'jest-mock-fetch';

const mockError = {
  status: 400,
  statusText: 'There was an error.',
  text: () => 'There was an error.'
};

const blogPost: BlogPostModel = {
  title: 'Fake Post',
  description: 'Fake blog post',
  post: 'This is a fake blog post for testing purposes.',
  categories: []
};

const link: LinkModel = {
  title: 'Fake Link',
  url: 'http://somewhere.com'
}

beforeEach(() => {
  process.env.API_URL = '/fake-url/';
  process.env.API_BLOG_KEY = 'fake-key';
  process.env.API_LINK_KEY = 'fake-key';
  type Fetch = typeof fetch;

  global.fetch = jestMockFetch as unknown as Fetch;
});

afterEach(() => {
  jestMockFetch.reset();
});

describe('API service', () => {
  test('GETs all blog post data.', (done) => {
    const thenFn = jest.fn();
    const catchFn = jest.fn();

    ApiService.getBlogPosts().then((res) => {
      thenFn(res);
      expect(thenFn).toHaveBeenCalledWith([]);
      done();
    }).catch(catchFn);
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_URL}blogPost`);

    jestMockFetch.mockResponse({
      json: () => []
    });
  });
  
  test('receives an error when there is a problem GETting blog post list data.', (done) => {
    const thenFn = jest.fn();
    const catchFn = jest.fn();

    ApiService.getBlogPosts().then(thenFn).catch((err) => {
      catchFn(err);
      expect(catchFn).toHaveBeenCalledWith(mockError);
      done();
    });
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_URL}blogPost`);

    jestMockFetch.mockError(mockError);
  });

  test('GETs blog post data.', () => {
    const thenFn = jest.fn();
    const catchFn = jest.fn();

    ApiService.getBlogPost('123').then(thenFn).catch(catchFn);
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_URL}blogPost/123`);
  });
  
  test('receives an error when there is a problem GETting blog post data.', (done) => {
    const thenFn = jest.fn();
    const catchFn = jest.fn();

    ApiService.getBlogPost('123').then(thenFn).catch((err) => {
      catchFn(err);
      expect(catchFn).toHaveBeenCalledWith(mockError);
      done();
    });
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_URL}blogPost/123`);

    jestMockFetch.mockError(mockError);
  });

  test('POSTs a blog post.', () => {
    const thenFn = jest.fn();
    const catchFn = jest.fn();

    ApiService.addBlogPost(blogPost).then(thenFn).catch(catchFn);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_URL}blogPost`,
      {
        body: JSON.stringify({
          document: blogPost,
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      }
    );
  });
  
  test('receives an error when there is a problem POSTing blog post data.', (done) => {
    const thenFn = jest.fn();
    const catchFn = jest.fn();

    ApiService.addBlogPost(blogPost).then(thenFn).catch((err) => {
      catchFn(err);
      expect(catchFn).toHaveBeenCalledWith(mockError);
      done();
    });
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_URL}blogPost`,
      {
        body: JSON.stringify({
          document: blogPost,
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      }
    );

    jestMockFetch.mockError(mockError);
  });

  test('GETs all links.', () => {
    const thenFn = jest.fn();
    const catchFn = jest.fn();

    ApiService.getLinks().then(thenFn).catch(catchFn);
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_URL}link`);
  });
  
  test('receives an error when there is a problem GETting links data.', (done) => {
    const thenFn = jest.fn();
    const catchFn = jest.fn();

    ApiService.getLinks().then(thenFn).catch((err) => {
      catchFn(err);
      expect(catchFn).toHaveBeenCalledWith(mockError);
      done();
    });
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_URL}link`);

    jestMockFetch.mockError(mockError);
  });

  test('POSTs a link.', () => {
    const thenFn = jest.fn();
    const catchFn = jest.fn();

    ApiService.addLink(link).then(thenFn).catch(catchFn);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_URL}link`,
      {
        body: JSON.stringify({
          document: link,
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      }
    );
  });
  
  test('receives an error when there is a problem POSTting links data.', (done) => {
    const thenFn = jest.fn();
    const catchFn = jest.fn();

    ApiService.addLink(link).then(thenFn).catch((err) => {
      catchFn(err);
      expect(catchFn).toHaveBeenCalledWith(mockError);
      done();
    });
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_URL}link`,
    {
      body: JSON.stringify({
        document: link,
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
      }
    );

    jestMockFetch.mockError(mockError);
  });
});