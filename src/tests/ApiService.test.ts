import ApiService from '../scripts/services/ApiService';
import { BlogPostModel } from './../scripts/models/BlogPost.model';
import { LinkModel } from '../scripts/models';
import jestMockFetch from 'jest-mock-fetch';

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
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_URL}blogpost?code=${process.env.API_BLOG_KEY}`);

    jestMockFetch.mockResponse({
      json: () => []
    });
  });
  
  test('GETs an error when there is a problem with blog post data.', (done) => {
    const thenFn = jest.fn();
    const catchFn = jest.fn();
    const mockError = {
      status: 400,
      statusText: 'There was an error.',
      text: () => 'There was an error.'
    };

    ApiService.getBlogPosts().then(thenFn).catch((err) => {
      catchFn(err);
      expect(catchFn).toHaveBeenCalledWith(mockError);
      done();
    });
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_URL}blogpost?code=${process.env.API_BLOG_KEY}`);

    jestMockFetch.mockError(mockError);
  });

  test('GETs blog post data.', () => {
    const thenFn = jest.fn();
    const catchFn = jest.fn();

    ApiService.getBlogPost('123').then(thenFn).catch(catchFn);
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_URL}blogpost?code=${process.env.API_BLOG_KEY}&id=123`);
  });

  test('POSTs a blog post.', () => {
    const thenFn = jest.fn();
    const catchFn = jest.fn();

    const blogPost: BlogPostModel = {
      title: 'Fake Post',
      description: 'Fake blog post',
      post: 'This is a fake blog post for testing purposes.',
      categories: []
    }

    ApiService.addBlogPost(blogPost).then(thenFn).catch(catchFn);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_URL}blogPost?code=${process.env.API_BLOG_KEY}`,
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

  test('GETs all links.', () => {
    const thenFn = jest.fn();
    const catchFn = jest.fn();

    ApiService.getLinks().then(thenFn).catch(catchFn);
    expect(fetch).toHaveBeenCalledWith(`${process.env.API_URL}link?code=${process.env.API_LINK_KEY}`);
  });

  test('POSTs a link.', () => {
    const thenFn = jest.fn();
    const catchFn = jest.fn();

    const link: LinkModel = {
      title: 'Fake Link',
      url: 'http://somewhere.com'
    }

    ApiService.addLink(link).then(thenFn).catch(catchFn);
    expect(fetch).toHaveBeenCalledWith(
      `${process.env.API_URL}link?code=${process.env.API_BLOG_KEY}`,
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
});