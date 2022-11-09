export type LoaderItemModel = {
  type: LoaderItemTypes;
  id?: string;
  description: string;
  isLoading: boolean;
}

export enum LoaderItemTypes {
  BLOG_POST = 'blog-post',
  BLOG_LIST = 'blog-list',
  LINK_LIST = 'link-list',
  STYLESHEET = 'stylesheet',
  FONTS = 'fonts'
}