export type LoaderItemModel = {
  type: LoaderItemTypes;
  id?: string | number;
  description: string;
  notification?: HTMLDivElement;
}

export enum LoaderItemTypes {
  BLOG_POST = 'blog-post',
  BLOG_LIST = 'blog-list',
  LINK_LIST = 'link-list',
  STYLESHEET = 'stylesheet',
  FONTS = 'fonts'
}