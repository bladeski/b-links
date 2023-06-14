import { LinkModel, LinkSectionModel } from '../scripts/models';

import pug from 'pug';
import { writeFile } from 'node:fs';

export function buildLinks(links: LinkModel[]): Promise<LinkSectionModel[]> {
  return new Promise((res, rej) => {

    const categories = new Set(links.reduce((prev, curr) => prev.concat(curr.categories || []), [] as string[]));
    const sections: LinkSectionModel[] = Array.from(categories).map(category => ({
      title: category,
      shortTitle: category.replace(/(^\W*)|(\W*$)/g, '').replace(/[\W_]+/g,"-").toLowerCase(),
      links: links.filter(link => link.categories?.includes(category))
    })).sort((a, b) => a.title.localeCompare(b.title));
    
    const fn = pug.compileFile('src/templates/links.pug', {});
  
    writeFile(`src/pages/links.html`, fn({sections}), (error) => {
      if (error) {
        rej(error);
      }
      res(sections);
    });
  });
}
