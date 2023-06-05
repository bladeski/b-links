import {
  BlogPostModel,
  getPostName,
} from '../scripts/models/BlogPost.model.js';

import DataManager from './dataManager.js';
import { LinkModel } from '../scripts/models/Link.model';
import { buildLinks } from './buildLinks.js';
import { buildPosts } from './buildPosts.js';
import cors from 'cors';
import express from 'express';

const app = express();
const port = 1236;

app.use(express.json());
app.use(cors());

app.get('/blogPost', (req, res) => {
  res.send(DataManager.blogPosts);
});

app.get('/blogPost/:id', (req, res) => {
  res.send(
    DataManager.blogPosts.find((blogPost) => blogPost._id === req.params.id)
  );
});

app.post('/blogPost', (req, res) => {
  const post = req.body.document;
  const created = new Date();
  const id = `${created.getTime()}${Math.floor(Math.random() * 1000)}`;
  post._id = id;
  post.createdAt = created;
  post.updatedAt = created;
  post.name = getPostName(post);

  DataManager
    .addBlogPost(post)
    .then(buildPosts)
    .then(() => onSuccess(res, post))
    .catch(() => onFailure(res, 'There was a problem saving the post.'));
});

app.put('/blogPost/:id', (req, res) => {
  const updatedPost = req.body.document as BlogPostModel;
  const existingPost = DataManager.blogPosts.find(
    (post) => post._id === req.params.id
  );
  if (existingPost) {
    existingPost.title = updatedPost.title;
    existingPost.description = updatedPost.description;
    existingPost.post = updatedPost.post;
    existingPost.categories = updatedPost.categories;
    existingPost.updatedAt = new Date();
    existingPost.draft = updatedPost.draft;

    DataManager
      .updateBlogPost(existingPost)
      .then(buildPosts)
      .then(() => onSuccess(res, existingPost))
      .catch(Promise.reject);
  } else {
    Promise.reject("The post doesn't exist.");
    console.error(updatedPost);
    res.sendStatus(404);
  }
});

app.get('/link', (req, res) => {
  res.send(DataManager.links);
});

app.post('/link', (req, res) => {
  const link = req.body.document as LinkModel;
  DataManager
    .addLink(link)
    .then(buildLinks)
    .then(() => onSuccess(res, link))
    .catch((err) => {
      console.log(err);
      onFailure(res, 'There was a problem saving the link.');
    });
});

app.listen(port, () => {
  console.log(`API started on port ${port}`);
});

function onSuccess(res: express.Response, data: any) {
  res.status(200).send(data);
}

function onFailure(res: express.Response, error: string) {
  res.status(500).send({ error });
}