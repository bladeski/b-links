export type LinkModel = {
  _id?: string;
  title: string;
  url: string;
  categories?: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type LinkGroupModel = {
  category: string;
  links: LinkModel[];
}
