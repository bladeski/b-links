import { mkdir, rm, writeFile } from 'node:fs';

import { BlogPostModel } from '../scripts/models/BlogPost.model';
import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';
import pug from 'pug';

export function buildPosts(posts: BlogPostModel[]) {
  clearPosts().then(() => {    
    if (Array.isArray(posts)) {
      const fn = pug.compileFile('src/templates/blogPost.pug', {});
      posts.forEach(post => {
        const year = new Date(post.createdAt || '').getFullYear();
        const dir = `src/pages/post/${year}`;
  
        mkdir(dir, { recursive: true }, (error) => {
          if (error) {
            console.log('error');
          } else {
            post.post = DOMPurify.sanitize(marked.parse(post.post));
            writeFile(`${dir}/${post.name || post._id}.html`, fn(post), (error) => {
              if (error) {
                console.log(error);
              }
            });
          }
        });
      });

      const fn1 = pug.compileFile('src/templates/blog.pug', {});
  
      writeFile(`src/pages/blog.html`, fn1({posts}), (error) => {
        if (error) {
          console.log(error);
        }
      });
    }
  });
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