import ApiService from '../scripts/services/data/ApiService';
import BlogService from '../scripts/services/BlogService';
import blogMock from '../mocks/blog.mock';

beforeEach(() => {
  const main = document.createElement('main');
  document.body.replaceChildren(main);
});

describe('Blog service', () => {
  test('loads blogs from localStorage', () => {
    ApiService.getBlogPosts = jest.fn(() => Promise.resolve([]));

    const posts = blogMock;
    localStorage.setItem('blogPosts', JSON.stringify(posts));

    const blogService = new BlogService();
    setTimeout(() => 
      expect(document.querySelectorAll('article').length).toBe(2)
    );
  });

  test('renders a single blog post', () => {
    jest.spyOn(URLSearchParams.prototype, 'get').mockImplementation(key => '2');
    ApiService.getBlogPosts = jest.fn(() => Promise.resolve([]));

    const posts = blogMock;
    localStorage.setItem('blogPosts', JSON.stringify(posts));

    const blogService = new BlogService();
    setTimeout(() => 
      expect(document.querySelectorAll('article').length).toBe(1)
    );
  });
});