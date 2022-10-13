import BlogService from './services/BlogService';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

document.addEventListener('DOMContentLoaded', () => {
  performance.mark('Load blog');
  console.debug(`You've opened the blog... well done!`);
  
  new BlogService();
});