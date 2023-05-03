import { LoaderType } from '../enums';

export type LoaderItemModel = {
  type: LoaderType;
  id?: string | number;
  description: string;
  notification?: HTMLDivElement;
  showMask?: boolean;
}