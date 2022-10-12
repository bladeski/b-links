import DOMPurify from 'dompurify';
import { marked } from 'marked';

document.addEventListener('DOMContentLoaded', () => {
  performance.mark('Load blog');
  console.debug(`You've opened the blog... well done!`);
  
  const main = document.querySelector('main');
  const heading = document.createElement('h2');
  heading.textContent = 'Blog';

  const subhead = document.createElement('span');
  subhead.className = 'subhead';
  subhead.textContent = ' A collection of my thoughts...'
  heading.appendChild(subhead);
  main?.appendChild(heading);

  const postId = processSearchParams();
  getBlogFromLocal()
    .then(processBlogPosts)
    .then((posts) => {
      if (postId) {
        renderBlogPost(posts, postId);
      } else {
        renderBlogList(posts);
      }
    })
    .then(downloadBlog)
    .then(saveBlogToLocal)
    .then(processBlogPosts)
    .then((posts) => {
      if (postId) {
        renderBlogPost(posts, postId);
      } else {
        renderBlogList(posts);
      }
    });
});

function processSearchParams(): string | null {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('id');
}

function renderBlogPost(posts: BlogPost[], postId: string) {
  const selectedPost = posts.find((post) => post._id === postId);

  if (selectedPost) {
    const main = document.querySelector('main');
    main?.replaceChildren(createBlogPostElement(selectedPost, false));
  } else {
    renderBlogList(posts);
  }
}

function renderBlogList(posts: BlogPost[]) {
  const main = document.querySelector('main');

  const postEls: HTMLElement[] = posts.map(createBlogPostSummaryElement);

  main?.querySelectorAll('[id^=blog-post_]').forEach((node) => node.remove());
  main?.append(...postEls);
}

function createBlogPostSummaryElement(post: BlogPost): HTMLElement {
  return createBlogPostElement(post, true);
}

function createBlogPostElement(post: BlogPost, isSummary = true): HTMLElement {
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

function downloadBlog(): Promise<BlogPost[]> {
  return new Promise((res, rej) => {
    fetch(
      `https://b-links-api.azurewebsites.net/api/blogpost?code=yYI3ZJltHczqBocn4eF8TqXkQ7vSToO2GFQ_uNV8zjOTAzFuTnS2Hg%3D%3D`
    )
      .then((res) => res.json())
      .then(res);
  });
}

function getBlogFromLocal(): Promise<BlogPost[]> {
  return new Promise((res, rej) => {
    const posts = localStorage.getItem('blogPosts') || '[]';
    res(JSON.parse(posts));
  });
}

function saveBlogToLocal(posts: BlogPost[]): Promise<BlogPost[]> {
  localStorage.setItem('blogPosts', JSON.stringify(posts));
  return Promise.resolve(posts);
}

function processBlogPosts(posts: BlogPost[]): Promise<BlogPost[]> {
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

type BlogPost = {
  _id: string;
  title: string;
  description: string;
  post: string;
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
};
