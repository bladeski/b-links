import { BlogPostModel, LinkModel } from '../scripts/models';
import { readFile, writeFile } from 'node:fs';

import { EventEmitter } from 'node:events';
import { buildIndex } from './buildIndex';
import { buildLinks } from './buildLinks';
import { buildPosts } from './buildPosts';

const BlogPostsDataFile = 'src/data/blogPosts.json';
const LinksDataFile = 'src/data/links.json';

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
        this._blogPosts = blogPosts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        this._links = links;
        this.ready = true;

        this.buildLinksAndPosts()
          .then(() => this.emit('data_manager_ready'));
      }).catch();
  }

  private generateId(): string {
    const created = new Date();
    return `${created.getTime()}${Math.floor(Math.random() * 1000)}`;
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
    const path = type === DataType.BLOG ? BlogPostsDataFile : LinksDataFile;
  
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

  private buildLinksAndPosts(): Promise<void> {
    return new Promise((res, rej) => {
      const publishedBlogPosts = this._blogPosts.filter(blogPost => !blogPost.draft);
      Promise
        .all([
          buildLinks(this._links),
          buildPosts(publishedBlogPosts)
        ])
        .then(([sections]) => buildIndex(publishedBlogPosts, sections))
        .then(res);
    });
  }

  public addLink(link: LinkModel): Promise<LinkModel> {
    link._id = this.generateId();
    if (!link.categories || link.categories.length === 0) {
      link.categories = ['Misc.'];
    }
    this._links.push(link);
    return new Promise((res, rej) =>
      writeFile(LinksDataFile, JSON.stringify(this._links), (err) => {
        if (err) {
          rej(err);
        } else {
          this.buildLinksAndPosts()
            .then(() => res(link));
        }
      })
    );
  }

  public removeLink(id: string): Promise<LinkModel[]> {
    return new Promise((res, rej) => {
      const index = this._links.findIndex(link => link._id === id);
      if (index < 0) {
        rej('There is no link with this id.');
      } else {
        this._links.splice(index, 1);
        writeFile(LinksDataFile, JSON.stringify(this._links), (err) => {
          if (err) {
            rej(err);
          } else {
            this.buildLinksAndPosts()
              .then(() => res(this._links));
          }
        });
      }
    });    
  }

  public addBlogPost(post: BlogPostModel): Promise<BlogPostModel> {
    post._id = this.generateId();
    this._blogPosts.push(post);
    return new Promise((res, rej) =>
      writeFile(BlogPostsDataFile, JSON.stringify(this._blogPosts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())), (err) => {
        if (err) {
          rej(err);
        } else {
          this.buildLinksAndPosts()
            .then(() => res(post));
        }
      })
    );
  }

  public updateBlogPost(post: BlogPostModel): Promise<BlogPostModel> {
    const index = this._blogPosts.findIndex(blogPost => blogPost._id === post._id);
    this._blogPosts[index] = post;
    return new Promise((res, rej) =>
      writeFile(BlogPostsDataFile, JSON.stringify(this._blogPosts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())), (err) => {
        if (err) {
          rej(err);
        } else {
          this.buildLinksAndPosts()
            .then(() => res(post));
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