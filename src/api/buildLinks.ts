import { LinkModel } from '../scripts/models';
import pug from 'pug';
import { writeFile } from 'node:fs';

export function buildLinks(links: LinkModel[]) {
  const categories = new Set(links.reduce((prev, curr) => prev.concat(curr.categories || []), [] as string[]));
  const sections = Array.from(categories).map(category => ({
    title: category,
    links: links.filter(link => link.categories?.includes(category))
  }));
  const misc = links.filter(link => !link.categories || link.categories.length === 0);

  if (misc.length) {
    sections.push({
      title: 'Misc.',
      links: misc
    });
  }
  
  const fn = pug.compileFile('src/templates/links.pug', {});

  writeFile(`src/pages/links.html`, fn({sections}), (error) => {
    if (error) {
      console.log(error);
    }
  });
}
