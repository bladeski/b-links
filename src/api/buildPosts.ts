import { mkdir, readFile, rm, writeFile } from 'node:fs';

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
  
      processBlogPosts(posts).then(blogPosts => {
        const config = {
          locals: {
            posts: blogPosts
          }
        };
        writeFile(`src/pages/.pugrc`, JSON.stringify(config), (error) => {
          if (error) {
            console.log(error);
          }
        });
      });
  
      // writeFile(`src/pages/posts/${post._id}.html`, fn(post), (error) => {
      //   if (error) {
      //     console.log(error);
      //   }
      // });
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

function processBlogPosts(posts: BlogPostModel[]) {
  return Promise.resolve(
    posts
      .map(processBlogPost)
      .sort(
        (a, b) =>
          (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
      )
  );
}

function processBlogPost(post: BlogPostModel) {
  return {
    ...post,
    createdAt: new Date(post.createdAt || ''),
    updatedAt: new Date(post.updatedAt || ''),
  };
}