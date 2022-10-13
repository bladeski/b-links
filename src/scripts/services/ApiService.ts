import { BlogPost } from '../models';

export default class ApiService {
  static getBlogPosts(): Promise<BlogPost[]> {
    return new Promise((res, rej) => {
      fetch(
        `https://b-links-api.azurewebsites.net/api/blogpost?code=yYI3ZJltHczqBocn4eF8TqXkQ7vSToO2GFQ_uNV8zjOTAzFuTnS2Hg%3D%3D`
      )
        .then((res) => res.json())
        .then(res);
    });
  }
}