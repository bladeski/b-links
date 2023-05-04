import { BlogPostModel, EventLogType, LinkModel } from '../models';

import { LoggingService } from './LoggingService';

export default class ApiService {
  static getBlogPost(id: string): Promise<BlogPostModel> {
    return new Promise((res, rej) => {
      fetch(
        `${process.env.API_URL}blogpost?code=${process.env.API_BLOG_KEY}${id ? '&id=' + id : ''}`
      )
      .then(this.getResponseJson)
      .then((result) => res(result))
      .catch(err => this.logError(
        'Unable to get blog post.',
        `We had a technical issue trying to get the requested blog post with id ${id}.
        Please try loading a post from the blog list or try again later.`,
        err,
        rej
      ));
    });
  }
  static getBlogPosts(): Promise<BlogPostModel[]> {
    return new Promise((res, rej) => {
      fetch(
        `${process.env.API_URL}blogpost?code=${process.env.API_BLOG_KEY}`
      )
      .then(this.getResponseJson)
      .then((result) => res(result))
      .catch(err => this.logError(
        'Unable to get blog posts.',
        'We had a technical issue trying to get the blog posts. Please try again.',
        err,
        rej
      ));
    });
  }
  static addBlogPost(post: BlogPostModel, id?: string): Promise<BlogPostModel> {
    return new Promise((res, rej) => {
      fetch(
        // `${process.env.API_URL}blogPost?code=${process.env.API_BLOG_KEY}`,
        'http://localhost:3000/blogPost',
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
      .then(this.getResponseJson)
      .then((result) => res(result))
      .catch(err => this.logError(
        'Unable to add blog posts.',
        'We had a technical issue trying to save the blog posts. Please try again.',
        err,
        rej
      ));
    });
  }
  static getLinks(): Promise<LinkModel[]> {
    return new Promise((res, rej) => {
      fetch(
        `${process.env.API_URL}link?code=${process.env.API_LINK_KEY}`
      )
      .then(this.getResponseJson)
      .then((result) => res(result))
      .catch(err => this.logError(
        'Unable to get links.',
        'We had a technical issue trying to get the links. Please try again.',
        err,
        rej
      ));
    });
  }
  static addLink(link: LinkModel): Promise<LinkModel> {
    return new Promise((res, rej) => {
      fetch(
        // `${process.env.API_URL}link?code=${process.env.API_LINK_KEY}`,
        'http://localhost:3000/link',
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
      .then(this.getResponseJson)
      .then((result) => res(result))
      .catch(err => this.logError(
        'Unable to add link.',
        'We had a technical issue trying to add the link. Please try again.',
        err,
        rej
      ));
    });
  }

  private static async logError(title: string, description: string, error: Response, rej: (reason: any) => void) {
    LoggingService.logEvent({
      title,
      description,
      type: EventLogType.ERROR,
      details: await this.getErrorDetails(error),
      showNotification: true
    });
    rej(error);
  }

  private static getResponseJson(response: Response) {
    if (response.ok) {
      return response.json();
    }
    throw response;
  }

  private static async getErrorDetails(response: Response): Promise<string> {
    const { status, statusText } = response;
    return JSON.stringify({
      status,
      statusText,
      text: await response.text()
    });
  }
}
