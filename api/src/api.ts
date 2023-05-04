import { LinkGroupModel, LinkModel } from './../../src/scripts/models/Link.model';
import { readFile, writeFile } from 'node:fs';

import { BlogPostModel } from './../../src/scripts/models/BlogPost.model';
import { Buffer } from 'node:buffer'
import cors from 'cors';
import express from 'express';
import { log } from 'node:console';

// import { writeFile } from 'node:fs/promises';



const app = express();
const port = 3000;

const blogPostFileUrl = 'src/data/blogPosts.json';
const linksFileUrl = 'src/data/links.json';

app.use(express.json());
app.use(cors());

app.post('/blogPost', (req, res) => {
  const post = req.body.document;
  const created = new Date();
  const id = `${created.getTime()}${Math.floor(Math.random() * 1000)}`;
  post._id = id;
  post.createdAt = created;
  post.updatedAt = created;

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
  console.log(`Example app listening on port ${port}`)
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
        res(JSON.parse(data) as BlogPostModel[]);
      } else {
        res([]);
      }
    })
  })
}

function writeBlogPosts(posts: BlogPostModel[]): Promise<void> {
  return new Promise((res, rej) => {
    writeFile(blogPostFileUrl, JSON.stringify(posts), (error) => {
      if (error) {
        rej(error);
      } else {
        res();
      }
    });
  })
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