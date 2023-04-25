import ApiService from './ApiService';
import { LinkGroupModel } from '../models/Link.model';
import { LinkModel } from '../models';

export default class LinkService {
  constructor() {  
    this.getLinksFromLocal()
      .then(this.processLinks.bind(this))
      .then((posts) => {
        this.renderLinks(posts);
      })
      .then(() => ApiService.getLinks())
      .then(this.saveLinksToLocal.bind(this))
      .then(this.processLinks.bind(this))
      .then((posts) => {
        this.renderLinks(posts);
      });
  }
  
  private renderLinks(links: LinkModel[]) {
    const main = document.querySelector('main');
    main?.querySelectorAll('section').forEach((node) => node.remove());

    const linkGroups = this.getLinkGroups(links);
    linkGroups.forEach(group => {
      const groupSection = document.createElement('section');
      
      const groupTitle = document.createElement('h2');
      groupTitle.innerText = group.category;
      groupSection.appendChild(groupTitle);

      const list = document.createElement('ul');
      const anchors: HTMLElement[] = group.links.map(this.createLinkElement.bind(this));
      list.append(...anchors);

      groupSection.appendChild(list);
      main?.appendChild(groupSection);
    });  
  }
  
  private createLinkElement(link: LinkModel): HTMLElement {
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
  
  private getLinksFromLocal(): Promise<LinkModel[]> {
    return new Promise((res, rej) => {
      const links = localStorage.getItem('links') || '[]';
      res(JSON.parse(links));
    });
  }
  
  private saveLinksToLocal(links: LinkModel[]): Promise<LinkModel[]> {
    localStorage.setItem('links', JSON.stringify(links));
    return Promise.resolve(links);
  }
  
  private processLinks(links: LinkModel[]): Promise<LinkModel[]> {
    return Promise.resolve(
      links
        .map((link) => ({
          ...link,
          createdAt: new Date(link.createdAt || ''),
          updatedAt: new Date(link.updatedAt || ''),
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  }

  private getCategories(links: LinkModel[]): string[] {
    const categories: string[] = [];

    links.forEach(link => categories.push(...link.categories || ''));
    return Array.from(new Set(categories));
  }

  private getLinkGroups(links: LinkModel[]): LinkGroupModel[] {
    const categories = this.getCategories(links);
    const linkGroups: LinkGroupModel[] = [];
    categories.forEach(category => {
      linkGroups.push({
        category,
        links: links
          .filter(link => link.categories?.some(linkCategory => linkCategory === category))
          .sort((a, b) => a.title.localeCompare(b.title))
      });
    });

    linkGroups.sort((a, b) => a.category.localeCompare(b.category));

    const misc = {
      category: 'Misc',
      links: links.filter(link => !link.categories || link.categories.length === 0)
    };

    if (misc.links.length > 0) {
      linkGroups.push(misc);
    }
    return linkGroups;
  }
}


