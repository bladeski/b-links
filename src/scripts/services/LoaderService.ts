import { ElementSelector } from '../enums';
import { LoaderItemModel } from '../models';

class _LoaderService {
  private itemsLoading: LoaderItemModel[] = [];

  constructor() {
    const mask = document.querySelector(`${ElementSelector.LOADER_CONTAINER_ID} ${ElementSelector.LOADER_MASK_CLASS}`);
    mask?.classList.remove('hide');
  }

  public setLoadItemState(item: LoaderItemModel, isLoading: boolean) {
    if (isLoading) {
      const itemExists = this.itemsLoading.some(
        (existingItem) =>
          existingItem.type === item.type && existingItem.id === item.id
      );
      
      if (!itemExists) {
        this.itemsLoading.push(item);
        
        item.notification = this.addLoader(item);
        this.setMask();
      }
    } else {
      const savedItem = this.itemsLoading.find(
        (existingItem) =>
          existingItem.type === item.type && existingItem.id === item.id
      );

      if (savedItem && savedItem.notification) {
        this.removeLoader(savedItem.notification).then(() => {
          const index = this.itemsLoading.findIndex(existingItem => existingItem === savedItem);
          this.itemsLoading.splice(index, 1);
          this.setMask();
        });
      }
    }
  }

  private addLoader(item: LoaderItemModel): HTMLDivElement {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.textContent = `Loading ${item.description}`;

    const notifications = document.querySelector(ElementSelector.LOADER_CONTAINER_ID);
    notifications?.appendChild(loader);
    return loader;
  }

  private removeLoader(loader: HTMLDivElement): Promise<void> {
    return new Promise((res) => {
      loader.classList.add('closing');
      setTimeout(() => {
        loader.remove();
        res();
      }, 500);
    });
  }

  public setMask() {
    const mask = document.querySelector(`${ElementSelector.LOADER_CONTAINER_ID} ${ElementSelector.LOADER_MASK_CLASS}`);

    if (mask && this.itemsLoading.some(item => item.showMask)) {
      mask.classList.remove('hide');
    } else if (mask) {
      mask.classList.add('hide');
    }
  }
}

const LoaderService = new _LoaderService();
export default LoaderService;
