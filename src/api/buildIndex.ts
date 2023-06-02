import { BlogPostModel } from '../scripts/models/BlogPost.model';
import { LinkSectionModel } from '../scripts/models';
import pug from 'pug';
import { writeFile } from 'node:fs';

export function buildIndex(posts: BlogPostModel[], links: LinkSectionModel[]): Promise<void> {
  return new Promise((res, rej) => {
    const fn2 = pug.compileFile('src/templates/index.pug', {});
    const latestPosts = posts.slice(-5).reverse();

    writeFile(`src/pages/index.html`, fn2({ posts: latestPosts, links }), (error) => {
      if (error) {
        rej(error);
      }
      res();
    });
  });
}