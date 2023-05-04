import { readFile, writeFile } from 'node:fs';

import { BlogPostModel } from '../src/scripts/models/BlogPost.model.js';
import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';
import pug from 'pug';

const blogPostFileUrl = 'src/data/blogPosts.json';

readFile(blogPostFileUrl, 'utf8', (err, data) => {
  const posts = JSON.parse(data) as BlogPostModel[];

  if (Array.isArray(posts)) {
    const fn = pug.compileFile('src/templates/blogPost.pug', {});
    posts.forEach(post => {
      post.post = DOMPurify.sanitize(marked.parse(post.post));
      writeFile(`src/pages/post/${post._id}.html`, fn(post), (error) => {
        if (error) {
          console.log(error);
        }
      });
    });

    processBlogPosts(posts).then(blogPosts => {
      const config = {
        locals: {
          posts: blogPosts
        }
      };
      writeFile(`src/pages/.pugrc`,JSON.stringify(config), (error) => {
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