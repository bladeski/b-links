import { BlogPostModel, LinkModel } from '../scripts/models';
import { readFile, writeFile } from 'node:fs';

import { EventEmitter } from 'node:events';
import { buildLinks } from './buildLinks.js';
import { buildPosts } from './buildPosts.js';

const BlogPostsFile = 'src/data/blogPosts.json';
const LinksFile = 'src/data/links.json';

enum DataType {
  BLOG = 'blog',
  LINK = 'link'
}

class _DataManager extends EventEmitter {
  private ready = false;
  private _blogPosts: BlogPostModel[] = [];
  private _links: LinkModel[] = [];

  public get blogPosts() {
    return this._blogPosts
  };

  public get links() {
    return this._links;
  }

  constructor() {
    super();
    Promise.all([this.getBlogPostsFromFile(), this.getLinksFromFile()])
      .then(([blogPosts, links]) => {
        this._blogPosts = blogPosts;
        this._links = links;
        this.ready = true;
        Promise.all([
          buildLinks(links),
          buildPosts(blogPosts)
        ]).then(() => this.emit('data_manager_ready'));
      }).catch();
  }

  private getBlogPostsFromFile(): Promise<BlogPostModel[]> {
    return new Promise((res, rej) => {
      res(this.getData(DataType.BLOG) as Promise<BlogPostModel[]>)
    });
  }

  private getLinksFromFile(): Promise<LinkModel[]> {
    return new Promise((res, rej) => {
      res(this.getData(DataType.LINK) as Promise<LinkModel[]>)
    });
  }

  private getData(type: DataType): Promise<any[]> {
    const path = type === DataType.BLOG ? BlogPostsFile : LinksFile;
  
    return new Promise((res, rej) => {
      readFile(path, 'utf8', (err, data) => {
        if (err) {
          rej(err);
        }
        if (data) {
          res(JSON.parse(data));
        } else {
          res([]);
        }
      });
    });
  }

  public addLink(link: LinkModel): Promise<LinkModel[]> {
    this._links.push(link);
    return new Promise((res, rej) =>
      writeFile(LinksFile, JSON.stringify(this._links), (err) => {
        if (err) {
          rej(err);
        } else {
          res(this._links);
        }
      })
    );
  }

  public addBlogPost(post: BlogPostModel): Promise<BlogPostModel[]> {
    this._blogPosts.push(post);
    return new Promise((res, rej) =>
      writeFile(BlogPostsFile, JSON.stringify(this._blogPosts), (err) => {
        if (err) {
          rej(err);
        } else {
          res(this._blogPosts);
        }
      })
    );
  }

  public updateBlogPost(post: BlogPostModel): Promise<BlogPostModel[]> {
    const index = this._blogPosts.findIndex(blogPost => blogPost._id === post._id);
    this._blogPosts[index] = post;
    return new Promise((res, rej) =>
      writeFile(BlogPostsFile, JSON.stringify(this._blogPosts), (err) => {
        if (err) {
          rej(err);
        } else {
          res(this._blogPosts);
        }
      })
    );
  }

  public isReady(): Promise<void> {
    return new Promise((res) => {
      if (this.ready) {
        res();
      } else {
        this.on('data_manager_ready', () => res());
      }
    });
  }
}

const DataManager = new _DataManager();
export default DataManager;