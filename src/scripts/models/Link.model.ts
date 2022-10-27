export type Link = {
  _id?: string;
  title: string;
  url: string;
  categories?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  token?: string;
};

export type LinkGroup = {
  category: string;
  links: Link[];
}