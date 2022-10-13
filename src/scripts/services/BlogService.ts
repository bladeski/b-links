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
    subhead.textContent = ' A collection of my thoughts...'
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
  
    const postEls: HTMLElement[] = posts.map(this.createBlogPostSummaryElement.bind(this));
  
    main?.querySelectorAll('[id^=blog-post_]').forEach((node) => node.remove());
    main?.append(...postEls);    
  }
  
  private createBlogPostSummaryElement(post: BlogPost): HTMLElement {
    return this.createBlogPostElement(post, true);
  }
  
  private createBlogPostElement(post: BlogPost, isSummary = true): HTMLElement {
    const blogPost = document.createElement('article');
    blogPost.id = `blog-post_${post._id}`;
  
    const title = document.createElement(isSummary ? 'h3' : 'h2');
    title.className = 'blog-post-title';
  
    if (isSummary) {
      const link = document.createElement('a');
      link.href = `/blog.html?id=${post._id}`;
      link.ariaLabel = post.title;
      link.textContent = post.title;
      title.appendChild(link);
    } else {
      title.textContent = post.title;
    }
  
    const date = document.createElement('span');
    date.className = 'subhead';
    date.textContent = `First posted ${post.createdAt.toLocaleDateString()}`;
  
    title.appendChild(date);
    blogPost.appendChild(title);
  
    if (isSummary && post.description) {
      const description = document.createElement('p');
      description.className = 'blog-post-description';
      description.textContent = post.description;
      blogPost.appendChild(description);
    } else if (!isSummary) {
      const content = document.createElement('div');
      content.innerHTML = DOMPurify.sanitize(marked.parse(post.post));
      blogPost.appendChild(content);
    }
  
    return blogPost;
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
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  }
}


