document.addEventListener('DOMContentLoaded', () => {
  performance.mark('Load blog')
  console.debug(`You've opened the blog... well done!`);

  getBlogFromLocal()
    .then(processBlogPosts)
    .then(renderBlogPosts)
    .then(downloadBlog)
    .then(saveBlogToLocal)
    .then(processBlogPosts)
    .then(renderBlogPosts);
});

function renderBlogPosts(posts: BlogPost[]) {
  const main = document.querySelector('main');
  const postEls: HTMLElement[] = [];
  posts.forEach(post => {
    const blogPost = document.createElement('article');
    blogPost.id = `blog-post_${post._id}`;
    
    const title = document.createElement('h3');
    title.className = 'blog-post-title';
    title.textContent = post.title;
    
    const date = document.createElement('span');
    date.className = 'subhead';
    date.textContent = `First posted ${post.createdAt.toLocaleDateString()}`;
    
    const content = document.createElement('p');
    content.className = 'blog-post-content';
    content.textContent = post.post;

    title.appendChild(date);

    blogPost.appendChild(title);
    blogPost.appendChild(content);

    postEls.push(blogPost);
  });

  main?.querySelectorAll('[id^=blog-post_]').forEach(node => node.remove());
  main?.append(...postEls);
}

function downloadBlog(): Promise<BlogPost[]> {
  return new Promise((res, rej) => {
    fetch(`https://b-links-api.azurewebsites.net/api/blogpost?code=yYI3ZJltHczqBocn4eF8TqXkQ7vSToO2GFQ_uNV8zjOTAzFuTnS2Hg%3D%3D`)
      .then(res => res.json())
      .then(res);
  });
}

function getBlogFromLocal(): Promise<BlogPost[]> {
  return new Promise((res, rej) => {
    const posts = localStorage.getItem('blogPosts') || '[]';
    res(JSON.parse(posts));
  })
}

function saveBlogToLocal(posts: BlogPost[]): Promise<BlogPost[]> {
  localStorage.setItem('blogPosts', JSON.stringify(posts));
  return Promise.resolve(posts);
}

function processBlogPosts(posts: BlogPost[]): Promise<BlogPost[]> {
  return Promise.resolve(posts.map(post => ({
    ...post,
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
  })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
}

type BlogPost = {
  _id: string,
  title: string,
  post: string,
  categories: string[],
  createdAt: Date,
  updatedAt: Date,
};