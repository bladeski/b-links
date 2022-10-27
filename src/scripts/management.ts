import ApiService from './services/ApiService';
import { BlogPost } from './models/BlogPost.model';
import DOMPurify from 'dompurify';
import { Link } from './models/Link.model';
import { marked } from 'marked';

document.addEventListener('DOMContentLoaded', () => {
  const postForm = document.forms.namedItem('AddPostForm');

  postForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const id = formData.get('id')?.toString() || undefined;
    const post: BlogPost = {
      title: formData.get('title')?.toString() || '',
      description: formData.get('description')?.toString() || '',
      post: formData.get('post')?.toString() || '',
      categories: formData.get('categories')?.toString().split(' ') || []
    };
    ApiService.addBlogPost(post, id).then(postForm.reset);
  });

  const postInput = postForm?.querySelector('textarea');
  postInput?.addEventListener('input', (event) => {
    const preview = document.getElementById('PostPreview') as HTMLElement;
    const markdown = DOMPurify.sanitize(marked.parse((event.target as HTMLTextAreaElement).value));
    preview.innerHTML = `${markdown}`;
  });

  const linkForm = document.forms.namedItem('AddLinkForm');
  linkForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const link: Link = {
      title: formData.get('title')?.toString() || '',
      url: formData.get('url')?.toString() || '',
      categories: formData.get('categories')?.toString().split(' ') || []
    };
    ApiService.addLink(link).then(linkForm.reset);
  });
});
