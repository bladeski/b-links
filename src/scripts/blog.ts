import BlogService from './services/BlogService';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

document.addEventListener('DOMContentLoaded', () => {
  console.debug(`You've opened the blog... well done!`);
  
  new BlogService();
});