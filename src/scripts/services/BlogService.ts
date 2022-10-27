import ApiService from './ApiService';
import { BlogPost } from '../models';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

export default class BlogService {
  constructor() {
    const main = document.querySelector('main');
    const heading = document.createElement('h2');
    heading.textContent = 'Blog';

    const subhead = document.createElement('span');
    subhead.className = 'subhead';
    subhead.textContent = ' A collection of my thoughts...';
    heading.appendChild(subhead);
    main?.appendChild(heading);

    const postId = this.processSearchParams();
    this.getBlogFromLocal()
      .then(this.processBlogPosts.bind(this))
      .then((posts) => {
        if (postId) {
          this.renderBlogPost(posts, postId);
        } else {
          this.renderBlogList(posts);
        }
      })
      .then(ApiService.getBlogPosts)
      .then(this.saveBlogToLocal.bind(this))
      .then(this.processBlogPosts.bind(this))
      .then((posts) => {
        if (postId) {
          this.renderBlogPost(posts, postId);
        } else {
          this.renderBlogList(posts);
        }
      });
  }

  private processSearchParams(): string | null {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('id');
  }

  private renderBlogPost(posts: BlogPost[], postId: string) {
    const selectedPost = posts.find((post) => post._id === postId);

    if (selectedPost) {
      const main = document.querySelector('main');
      main?.replaceChildren(this.createBlogPostElement(selectedPost, false));
    } else {
      this.renderBlogList(posts);
    }
  }

  private renderBlogList(posts: BlogPost[]) {
    const main = document.querySelector('main');

    const postEls: HTMLElement[] = posts.map(
      this.createBlogPostSummaryElement.bind(this)
    );

    main?.querySelectorAll('[id^=blog-post_]').forEach((node) => node.remove());
    main?.append(...postEls);
  }

  private createBlogPostSummaryElement(post: BlogPost): HTMLElement {
    return this.createBlogPostElement(post, true);
  }

  private createBlogPostElement(post: BlogPost, isSummary = true): HTMLElement {
    const template = document.getElementById(
      isSummary ? 'BlogPostListTemplate' : 'BlogPostTemplate'
    ) as HTMLTemplateElement;

    if (template && 'content' in document.createElement('template')) {
      // `<template>` is supported.

      const clone = template.content.cloneNode(true) as DocumentFragment;
      const blogPost = clone.querySelector('.blog-post') as HTMLElement;
      blogPost.id = `blog-post_${post._id}`;

      const title = blogPost.querySelector('.blog-post-title') as HTMLAnchorElement;

      if (isSummary) {
        title.href = `/blog.html?id=${post._id}`;
        title.ariaLabel = post.title;
        title.textContent = post.title;
      } else {
        title.textContent = post.title;
      }

      const date = blogPost.querySelector('.subhead') as HTMLElement;
      date.textContent = `First posted ${post.createdAt?.toLocaleDateString()}`;

      if (isSummary && post.description) {
        const description = blogPost.querySelector(
          '.blog-post-description'
        ) as HTMLElement;
        description.textContent = post.description;
      } else if (!isSummary) {
        const content = blogPost.querySelector(
          '.blog-post-content'
        ) as HTMLElement;
        content.innerHTML = DOMPurify.sanitize(marked.parse(post.post));
      }

      return blogPost;
    }
    return document.createElement('div');
  }

  private getBlogFromLocal(): Promise<BlogPost[]> {
    return new Promise((res, rej) => {
      const posts = localStorage.getItem('blogPosts') || '[]';
      res(JSON.parse(posts));
    });
  }

  private saveBlogToLocal(posts: BlogPost[]): Promise<BlogPost[]> {
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    return Promise.resolve(posts);
  }

  private processBlogPosts(posts: BlogPost[]): Promise<BlogPost[]> {
    return Promise.resolve(
      posts
        .map((post) => ({
          ...post,
          createdAt: new Date(post.createdAt || ''),
          updatedAt: new Date(post.updatedAt || ''),
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  }
}
