import ApiService from '../scripts/services/data/ApiService';
import LinkService from '../scripts/services/LinkService';
import linkMock from '../mocks/links.mock';

beforeEach(() => {
  ApiService.getLinks = jest.fn(() => Promise.resolve([]));
  const main = document.createElement('main');
  document.body.replaceChildren(main);
});

describe('Link service', () => {
  test('the link is rendered', () => {
    const linkService = new LinkService();
    const main = document.querySelector('main');
    expect(main?.children.length).toBe(0);
  });

  test('loads links from localStorage', () => {
    const posts = linkMock;
    localStorage.setItem('links', JSON.stringify(posts));

    const linkService = new LinkService();
    setTimeout(() => 
      expect(document.querySelectorAll('article').length).toBe(2)
    );
  });
});