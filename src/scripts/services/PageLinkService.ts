
export class PageLinkService {
  static createPageLink(id: string): HTMLAnchorElement {
    const pageLink = document.createElement('a');
    pageLink.href = `#${id}`;
    pageLink.className = 'page-link';

    return pageLink;
  }
}