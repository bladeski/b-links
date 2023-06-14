import {
  BlogPostModel,
  getPostName,
} from '../scripts/models/BlogPost.model';

import DataManager from './dataManager';
import { LinkModel } from '../scripts/models/Link.model';
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
  post.createdAt = created;
  post.updatedAt = created;
  post.name = getPostName(post);

  DataManager
    .addBlogPost(post)
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
    existingPost.createdAt = existingPost.draft ? new Date() : existingPost.createdAt;
    existingPost.updatedAt = new Date();
    existingPost.draft = updatedPost.draft;

    DataManager
      .updateBlogPost(existingPost)
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
    .then(() => onSuccess(res, link))
    .catch((err) => {
      console.log(err);
      onFailure(res, 'There was a problem saving the link.');
    });
});

app.delete('/link/:id', (req, res) => {
  const linkId = req.params.id;
  DataManager
    .removeLink(linkId)
    .then((links) => onSuccess(res, links))
    .catch((err) => {
      console.log(err);
      onFailure(res, 'There was a problem deleting the link.');
    });
})

app.listen(port, () => {
  console.log(`API started on port ${port}`);
});

function onSuccess(res: express.Response, data: any) {
  res.status(200).send(data);
}

function onFailure(res: express.Response, error: string) {
  res.status(500).send({ error });
}