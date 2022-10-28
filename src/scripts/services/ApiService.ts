import { BlogPost, Link } from '../models';

export default class ApiService {
  static getBlogPosts(): Promise<BlogPost[]> {
    return new Promise((res, rej) => {
      fetch(
        `${process.env.API_URL}blogpost?code=${process.env.API_BLOG_KEY}`
      )
        .then((result) => result.json())
        .then((result) => res(result));
    });
  }
  static addBlogPost(post: BlogPost, id?: string): Promise<BlogPost> {
    post.token = process.env.AUTH_TOKEN || '';
    return new Promise((res, rej) => {
      fetch(
        `${process.env.API_URL}blogPost?code=${process.env.API_BLOG_KEY}`,
        {
          method: id ? 'PUT' : 'POST',
          body: JSON.stringify({
            id,
            document: post
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
        .then((result) => result.json())
        .then((result) => res(result));
    });
  }
  static getLinks(): Promise<Link[]> {
    return new Promise((res, rej) => {
      fetch(
        `${process.env.API_URL}link?code=${process.env.API_LINK_KEY}`
      )
        .then((result) => result.json())
        .then((result) => res(result));
    });
  }
  static addLink(link: Link): Promise<Link> {
    link.token = process.env.AUTH_TOKEN || '';
    return new Promise((res, rej) => {
      fetch(
        `${process.env.API_URL}link?code=${process.env.API_LINK_KEY}`,
        {
          method: 'POST',
          body: JSON.stringify({
            document: link
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      .then((result) => result.json())
      .then((result) => res(result));
    });
  }
}
