import { LoaderItemModel } from '../models/LoaderItem.model';

class _LoaderService {
  private itemsLoading: LoaderItemModel[] = [];

  public setLoadItemState(item: LoaderItemModel, isLoading: boolean) {
    if (isLoading) {
      !this.itemsLoading.some(
        (existingItem) =>
          existingItem.type === item.type && existingItem.id === item.id
      ) && this.itemsLoading.push(item);
      
      item.notification = this.addLoader(item);
    } else {
      const savedItemIndex = this.itemsLoading.findIndex(
        (existingItem) =>
          existingItem.type === item.type && existingItem.id === item.id
      );

      if (savedItemIndex >= 0) {
        const savedItem = this.itemsLoading.splice(savedItemIndex, 1)[0];
  
        if (savedItem && savedItem.notification) {
          this.removeLoader(savedItem.notification);
        }
      }
    }
  }

  private addLoader(item: LoaderItemModel): HTMLDivElement {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerText = `Loading ${item.description}`;

    const notifications = document.getElementById('Notifications');
    notifications?.prepend(loader);
    return loader;
  }

  private removeLoader(loader: HTMLDivElement) {
    loader.classList.add('closing');
    setTimeout(() => loader.remove(), 500);
  }
}

const LoaderService = new _LoaderService();
export default LoaderService;
