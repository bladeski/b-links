import ApiService from './ApiService';
import { Link } from '../models';

export default class LinkService {
  constructor() {  
    this.getLinksFromLocal()
      .then(this.processLinks.bind(this))
      .then((posts) => {
        this.renderLinks(posts);
      })
      .then(ApiService.getLinks)
      .then(this.saveLinksToLocal.bind(this))
      .then(this.processLinks.bind(this))
      .then((posts) => {
        this.renderLinks(posts);
      });
  }
  
  private renderLinks(links: Link[]) {
    const main = document.querySelector('main');
    const list = document.createElement('ul');
  
    const anchors: HTMLElement[] = links.map(this.createLinkElement.bind(this));
  
    main?.querySelectorAll('ul').forEach((node) => node.remove());
    list?.append(...anchors);
    main?.appendChild(list);
  }
  
  private createLinkElement(link: Link): HTMLElement {
    const item = document.createElement('li');
    item.id = `link_${link._id}`;

    const anchor = document.createElement('a');
    const url = new URL(link.url);
    
    anchor.href = link.url;
    anchor.ariaLabel = `${link.title} (${url.hostname})`;
    anchor.textContent = link.title;
    
    item.appendChild(anchor);
    return item;
  }
  
  private getLinksFromLocal(): Promise<Link[]> {
    return new Promise((res, rej) => {
      const links = localStorage.getItem('links') || '[]';
      res(JSON.parse(links));
    });
  }
  
  private saveLinksToLocal(links: Link[]): Promise<Link[]> {
    localStorage.setItem('links', JSON.stringify(links));
    return Promise.resolve(links);
  }
  
  private processLinks(links: Link[]): Promise<Link[]> {
    return Promise.resolve(
      links
        .map((link) => ({
          ...link,
          createdAt: new Date(link.createdAt),
          updatedAt: new Date(link.updatedAt),
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  }
}


