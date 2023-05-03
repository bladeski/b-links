import { BlogPostModel, LoaderItemModel } from '../models';
import { ElementSelector, LoaderType, LocalStorageItem } from '../enums';

import ApiService from './ApiService';
import DOMPurify from 'dompurify';
import LoaderService from './LoaderService';
import { marked } from 'marked';

export default class BlogService {
  postId: string | null;

  constructor() {
    this.postId = this.processSearchParams();

    if (this.postId) {
      this.renderBlogPost(this.postId);
    } else {
      this.getAndRenderList();
    }
  }

  private processSearchParams(): string | null {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('id');
  }

  private renderBlogPost(postId: string) {
    const loaderItem: LoaderItemModel = {
      type: LoaderType.BLOG_POST,
      id: postId,
      description: 'Blog post',
      showMask: true
    }
    LoaderService.setLoadItemState(loaderItem, true);
    if (postId) {
      const main = document.querySelector(ElementSelector.MAIN_CONTENT);

      ApiService.getBlogPost(postId)
        .then((selectedPost) => {
          main?.replaceChildren(
            this.createBlogPostElement(
              this.processBlogPost(selectedPost),
              false
            )
          );
          LoaderService.setLoadItemState(loaderItem, false);
        })
        .catch(() => {
          this.getAndRenderList();
          if (history.pushState) {
            const url = `${window.location.origin}${window.location.pathname}`;
            history.pushState({ path: url }, '', url);
          }
          LoaderService.setLoadItemState(loaderItem, true);
        });
    }
  }

  private renderBlogList(posts: BlogPostModel[]) {
    const main = document.querySelector(ElementSelector.MAIN_CONTENT);

    const postEls: HTMLElement[] = posts.map(
      this.createBlogPostSummaryElement.bind(this)
    );

    main?.querySelectorAll(`[id^=${ElementSelector.BLOG_POST_ID_PREFIX}]`).forEach((node) => node.remove());
    main?.append(...postEls);
  }

  private createBlogPostSummaryElement(post: BlogPostModel): HTMLElement {
    return this.createBlogPostElement(post, true);
  }

  private createBlogPostElement(
    post: BlogPostModel,
    isSummary = true
  ): HTMLElement {
    const template = document.querySelector(
      isSummary ? ElementSelector.BLOG_POST_LIST_TEMPLATE_ID : ElementSelector.BLOG_POST_TEMPLATE_ID
    ) as HTMLTemplateElement;

    if (template && 'content' in document.createElement('template')) {
      // `<template>` is supported.

      const clone = template.content.cloneNode(true) as DocumentFragment;
      const blogPost = clone.querySelector(ElementSelector.BLOG_POST_CLASS) as HTMLElement;
      blogPost.id = `${ElementSelector.BLOG_POST_ID_PREFIX}${post._id}`;

      const title = blogPost.querySelector(
        ElementSelector.BLOG_POST_TITLE_CLASS
      ) as HTMLAnchorElement;

      if (isSummary) {
        title.href = `./blog.html?id=${post._id}`;
        title.ariaLabel = post.title;
        title.textContent = post.title;
      } else {
        title.textContent = post.title;
      }

      const date = blogPost.querySelector(ElementSelector.SUBHEAD_CLASS) as HTMLElement;
      date.textContent = post.createdAt ? `First posted ${post.createdAt?.toLocaleDateString()}` : post.description;

      if (isSummary && post.description) {
        const description = blogPost.querySelector(
          ElementSelector.BLOG_POST_DESCRIPTION_CLASS
        ) as HTMLElement;
        description.textContent = post.description;
      } else if (!isSummary) {
        const content = blogPost.querySelector(
          ElementSelector.BLOG_POST_CONTENT_CLASS
        ) as HTMLElement;
        content.innerHTML = DOMPurify.sanitize(marked.parse(post.post));
      }

      return blogPost;
    }
    return document.createElement('div');
  }

  private getBlogFromLocal(): Promise<BlogPostModel[]> {
    return new Promise((res, rej) => {
      const posts = localStorage.getItem(LocalStorageItem.BLOG_POSTS) || '[]';
      res(JSON.parse(posts));
    });
  }

  private saveBlogToLocal(posts: BlogPostModel[]): Promise<BlogPostModel[]> {
    localStorage.setItem(LocalStorageItem.BLOG_POSTS, JSON.stringify(posts));
    return Promise.resolve(posts);
  }

  private processBlogPosts(posts: BlogPostModel[]): Promise<BlogPostModel[]> {
    return Promise.resolve(
      posts
        .map(this.processBlogPost)
        .sort(
          (a, b) =>
            (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
        )
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
    const loaderItem: LoaderItemModel = {
      type: LoaderType.BLOG_LIST,
      description: 'Blog list',
      showMask: true
    };
    LoaderService.setLoadItemState(loaderItem, true);
    this.getBlogFromLocal()
      .then(this.processBlogPosts.bind(this))
      .then(this.renderBlogList.bind(this))
      .then(() => {
        LoaderService.setLoadItemState(loaderItem, false)
      })
      .then(() => ApiService.getBlogPosts())
      .then(this.saveBlogToLocal.bind(this))
      .then(this.processBlogPosts.bind(this))
      .then(this.renderBlogList.bind(this));
  }
}
