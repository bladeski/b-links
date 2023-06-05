export type BlogPostModel = {
  _id?: string;
  title: string;
  description: string;
  post: string;
  markup?: string;
  categories: string[];
  createdAt?: Date;
  updatedAt?: Date;
  name?: string;
  draft?: boolean;
};

export function getPostName(post: BlogPostModel): string {
  return post.title.replace(/(^\W*)|(\W*$)/g, '').replace(/[\W_]+/g,"-");
}