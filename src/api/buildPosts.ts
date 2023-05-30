import { mkdir, rm, writeFile } from 'node:fs';

import { BlogPostModel } from '../scripts/models/BlogPost.model';
import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';
import pug from 'pug';

export function buildPosts(posts: BlogPostModel[]): Promise<void> {
  return new Promise((res, rej) => {
    clearPosts().then(() => {
      if (Array.isArray(posts)) {
        const fn = pug.compileFile('src/templates/blogPost.pug', {});
        const promises = posts.map(post => writePost(post, fn));
  
        Promise.all(promises).then(() => {

          const fn1 = pug.compileFile('src/templates/blog.pug', {});
    
          writeFile(`src/pages/blog.html`, fn1({ posts }), (error) => {
            if (error) {
              rej(error);
            }
            res();
          });

          const fn2 = pug.compileFile('src/templates/index.pug', {});
          const latestPosts = posts.slice(-5).reverse();
    
          writeFile(`src/pages/index.html`, fn2({ posts: latestPosts }), (error) => {
            if (error) {
              rej(error);
            }
            res();
          });
        });
      }
    });
  });
}

function writePost(post: BlogPostModel, fn: pug.compileTemplate): Promise<void> {
  return new Promise((res, rej) => {
    const year = new Date(post.createdAt || '').getFullYear();
    const dir = `src/pages/post/${year}`;

    mkdir(dir, { recursive: true }, (err) => {
      if (err) {
        rej(err);
      } else {
        post.markup = DOMPurify.sanitize(marked.parse(post.post));
        writeFile(`${dir}/${post.name || post._id}.html`, fn(post), (error) => {
          if (error) {
            rej(error);
          }
          res();
        });
      }
    });
  })
}

function clearPosts(): Promise<void> {
  const postPath = 'src/pages/post';
  return new Promise((res, rej) => {
    rm(postPath, {
      recursive: true,
      force: true
    }, (err) => {
      if (err) {
        rej(err);
      } else {
        mkdir(postPath, { recursive: true }, (error) => {
          if (error) {
            rej(error);
          } else {
            res();
          }
        });
      }
    })
  });
}