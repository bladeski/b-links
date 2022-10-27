import { BlogPost, Link } from '../models';

export default class ApiService {
  static getBlogPosts(): Promise<BlogPost[]> {
    return new Promise((res, rej) => {
      fetch(
        `${process.env.API_URL}blogpost?code=${process.env.API_BLOG_KEY}`
      )
        .then((res) => res.json())
        .then(res);
    });
  }
  static getLinks(): Promise<Link[]> {
    return new Promise((res, rej) => {
      fetch(
        `${process.env.API_URL}link?code=${process.env.API_LINK_KEY}`
      )
        .then((res) => res.json())
        .then(res);
    });
  }
}