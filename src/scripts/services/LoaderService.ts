import { LoaderItemModel } from '../models/LoaderItem.model';

class _LoaderService {
  private itemsLoading: LoaderItemModel[] = [];

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
    loader.innerText = `Loading ${item.description}`;

    const notifications = document.getElementById('Loaders');
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
    const mask = document.querySelector('#Loaders .mask');

    if (mask && this.itemsLoading.some(item => item.showMask)) {
      mask.classList.remove('hide');
    } else if (mask) {
      mask.classList.add('hide');
    }
  }
}

const LoaderService = new _LoaderService();
export default LoaderService;
