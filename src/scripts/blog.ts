import BlogService from './services/BlogService';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

document.addEventListener('DOMContentLoaded', () => {  
  new BlogService();
});