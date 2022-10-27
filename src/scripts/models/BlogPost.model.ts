export type BlogPost = {
  _id?: string;
  title: string;
  description: string;
  post: string;
  categories: string[];
  createdAt?: Date;
  updatedAt?: Date;
  token?: string;
};