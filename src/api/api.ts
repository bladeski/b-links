import { BlogPostModel, getPostName } from '../scripts/models/BlogPost.model.js';
import { readFile, writeFile } from 'node:fs';

import { LinkModel } from '../scripts/models/Link.model';
import { buildPosts } from './buildPosts.js';
import cors from 'cors';
import express from 'express';

const app = express();
const port = 1236;

const blogPostFileUrl = 'src/pages/.pugrc';
const linksFileUrl = 'src/data/links.json';

app.use(express.json());
app.use(cors());

app.get('/blogPost', (req, res) => {
  getBlogPosts()
    .then(blogPosts => res.send(blogPosts))
    .catch(() => onFailure(res, 'There was a problem getting the blogPosts.'));
});

app.get('/blogPost/:id', (req, res) => {
  getBlogPosts()
    .then(blogPosts => {
      const post = blogPosts.find(blogPost => blogPost._id === req.params.id);

      if (post) {
        res.send(post);
      } else {
        res.sendStatus(404);
      }
    })
    .catch(() => onFailure(res, 'There was a problem getting the blogPosts.'));
});

app.post('/blogPost', (req, res) => {
  const post = req.body.document;
  const created = new Date();
  const id = `${created.getTime()}${Math.floor(Math.random() * 1000)}`;
  post._id = id;
  post.createdAt = created;
  post.updatedAt = created;
  post.name = getPostName(post);

  getBlogPosts().then(posts => {
    posts.push(post);

    writeBlogPosts(posts)
      .then(() => onSuccess(res, post))
      .catch(Promise.reject);
  })
  .catch(() => onFailure(res, 'There was a problem saving the post.'));
});

app.put('/blogPost', (req, res) => {
  getBlogPosts().then(posts => {
    const updatedPost = req.body.document as BlogPostModel;
    const existingPost = posts.find(post => post._id === updatedPost._id);
    if (existingPost) {
      existingPost.title = updatedPost.title;
      existingPost.description = updatedPost.description;
      existingPost.post = updatedPost.post;
      existingPost.categories = updatedPost.categories;
      existingPost.updatedAt = new Date();
      
      writeBlogPosts(posts)
        .then(() => onSuccess(res, existingPost))
        .catch(Promise.reject);
    } else {
      Promise.reject('The post doesn\'t exist.')
    }
  })
  .catch((err) => onFailure(res, err || 'There was a problem saving the post.'));
});

app.get('/link', (req, res) => {
  getLinks()
    .then(links => res.send(links))
    .catch(() => onFailure(res, 'There was a problem getting the links.'));
});

app.post('/link', (req, res) => {
  getLinks().then(links => {
    const link = req.body.document as LinkModel;
    links.push(link);

    writeFile(linksFileUrl, JSON.stringify(links), (error) => {
      if (error) {
        Promise.reject(error);
      } else {
        onSuccess(res, link);
      }
    });
  })
  .catch(() => onFailure(res, 'There was a problem saving the link.'));
});

app.listen(port, () => {
  console.log(`API started on port ${port}`)
});

function onSuccess(res: express.Response, data: any) {
  res.status(200).send(data);
}

function onFailure(res: express.Response, error: string) {
  res.status(500).send({error});
}

function getBlogPosts(): Promise<BlogPostModel[]> {
  return new Promise((res, rej) => {
    readFile(blogPostFileUrl, 'utf8', (err, data) => {
      if (data) {
        res(JSON.parse(data).locals.posts as BlogPostModel[]);
      } else {
        res([]);
      }
    })
  })
}

function writeBlogPosts(posts: BlogPostModel[]): Promise<void> {
  return new Promise((res, rej) => {
    buildPosts(posts);
  });
}

function getLinks(): Promise<LinkModel[]> {
  return new Promise((res, rej) => {
    readFile(linksFileUrl, 'utf8', (err, data) => {
      if (data) {
        res(JSON.parse(data) as LinkModel[]);
      } else {
        res([]);
      }
    });
  });
}