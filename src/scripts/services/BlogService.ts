import ApiService from './ApiService';
import { BlogPostModel } from '../models';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

export default class BlogService {
  postId: string | null;

  constructor() {
    const main = document.querySelector('main');
    const heading = document.createElement('h2');
    heading.textContent = 'Blog';

    const subhead = document.createElement('span');
    subhead.className = 'subhead';
    subhead.textContent = ' A collection of my thoughts...';
    heading.appendChild(subhead);
    main?.appendChild(heading);

    this.postId = this.processSearchParams();

    if (this.postId) {
      this.renderBlogPost(this.postId)
    } else {
      this.getAndRenderList()
    }
  }

  private processSearchParams(): string | null {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('id');
  }

  private renderBlogPost(postId: string) {
    if (postId) {
      ApiService.getBlogPost(postId).then(selectedPost => {
        const main = document.querySelector('main');
        main?.replaceChildren(
          this.createBlogPostElement(
            this.processBlogPost(selectedPost), false
          )
        );
      })
      .catch(() => {
        this.getAndRenderList();
        if (history.pushState) {
          const url = `${window.location.origin}${window.location.pathname}`;
          history.pushState({ path: url }, '', url);
        }
      });
    }
  }

  private renderBlogList(posts: BlogPostModel[]) {
    const main = document.querySelector('main');

    const postEls: HTMLElement[] = posts.map(
      this.createBlogPostSummaryElement.bind(this)
    );

    main?.querySelectorAll('[id^=blog-post_]').forEach((node) => node.remove());
    main?.append(...postEls);
  }

  private createBlogPostSummaryElement(post: BlogPostModel): HTMLElement {
    return this.createBlogPostElement(post, true);
  }

  private createBlogPostElement(post: BlogPostModel, isSummary = true): HTMLElement {
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
        title.href = `./blog.html?id=${post._id}`;
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

  private getBlogFromLocal(): Promise<BlogPostModel[]> {
    return new Promise((res, rej) => {
      const posts = localStorage.getItem('blogPosts') || '[]';
      res(JSON.parse(posts));
    });
  }

  private saveBlogToLocal(posts: BlogPostModel[]): Promise<BlogPostModel[]> {
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    return Promise.resolve(posts);
  }

  private processBlogPosts(posts: BlogPostModel[]): Promise<BlogPostModel[]> {
    return Promise.resolve(
      posts
        .map(this.processBlogPost)
        .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
    );
  }

  private processBlogPost(post: BlogPostModel): BlogPostModel {
    return {
      ...post,
      createdAt: new Date(post.createdAt || ''),
      updatedAt: new Date(post.updatedAt || ''),
    };
  }

  private getAndRenderList() {
    this.getBlogFromLocal()
      .then(this.processBlogPosts.bind(this))
      .then(this.renderBlogList.bind(this))
      .then(() => ApiService.getBlogPosts())
      .then(this.saveBlogToLocal.bind(this))
      .then(this.processBlogPosts.bind(this))
      .then(this.renderBlogList.bind(this));
  }
}
