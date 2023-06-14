import * as fs from 'node:fs';

import { readFile, writeFile } from 'node:fs';

import { BlogPostModel } from '../../scripts/models';
import DataManager from '../../api/dataManager';
import { LinkModel } from './../../scripts/models/Link.model';

// import fs from 'node';

jest.mock('node:fs', () => ({
  ...jest.requireActual('node:fs'),
  readFile: (path: string, encoding: string, callback: () => void) => {
    callback();
  },
  writeFile: (path: string, data: string, callback: () => void) => {
    callback();
  },
  mkdir: (path: string, options: any, callback: () => void) => {
    callback();
  },
  rm: (path: string, data: string, callback: () => void) => {
    callback();
  },
}));
// jest.spyOn(fs, 'readFile')
//   .mockImplementation(() => { });

beforeAll(async () => {
  await DataManager.isReady();
});

describe('DataManager', () => {
  test('notifies when it has loaded.', () => {
    expect(DataManager.blogPosts).toBeDefined();
  });

  test('adds a link.', async () => {
    const link: LinkModel = {
      title: 'Fancy Link v1',
      url: 'http://example.com/link1',
      categories: ['test']
    };

    const saved = await DataManager.addLink(link);
    const savedLink = DataManager.links.find(savedLink => savedLink._id === saved._id);
    expect(savedLink).toBeDefined();
    expect(savedLink?.title).toBe(link.title);
    expect(savedLink?.url).toBe(link.url);
    expect(savedLink?.categories).toStrictEqual(['test']);
  });

  test('adds a link without a category.', async () => {
    const link: LinkModel = {
      title: 'Fancy Link v2',
      url: 'http://example.com/link2'
    };

    const saved = await DataManager.addLink(link);
    const savedLink = DataManager.links.find(savedLink => savedLink._id === saved._id);
    expect(savedLink).toBeDefined();
    expect(savedLink?.title).toBe(link.title);
    expect(savedLink?.url).toBe(link.url);
    expect(savedLink?.categories).toStrictEqual(['Misc.']);
  });

  test('removes a link.', async () => {
    const linkId = DataManager.links[0]._id || '';
    await DataManager.removeLink(linkId);
    const link = DataManager.links.find(savedLink => savedLink._id === linkId);
    expect(link).toBeUndefined();
  });
  
  test('returns an error when trying to remove a link with an invalid id.', async () => {
    const linkId = '';
    await expect(DataManager.removeLink(linkId))
      .rejects.toBe('There is no link with this id.');
  });

  test('adds a blog post.', async () => {
    const post: BlogPostModel = {
      title: 'Test Post',
      description: 'This is a test post.',
      post: 'This is the post itself.',
      categories: ['test']
    };
    await DataManager.addBlogPost(post);
    expect(DataManager.blogPosts.length).toBe(1);
    expect(DataManager.blogPosts[0].title).toBe(post.title);
    expect(DataManager.blogPosts[0].description).toBe(post.description);
    expect(DataManager.blogPosts[0].post).toBe(post.post);
    expect(DataManager.blogPosts[0].categories).toBe(post.categories);
  });

  test('updates a blog post.', async () => {
    const post = {...DataManager.blogPosts[0]};
    post.title = 'This is an updated post.';
    await DataManager.updateBlogPost(post);
    expect(DataManager.blogPosts.length).toBe(1);
    expect(DataManager.blogPosts[0].title).toBe(post.title);
    expect(DataManager.blogPosts[0].description).toBe(post.description);
    expect(DataManager.blogPosts[0].post).toBe(post.post);
  });
});