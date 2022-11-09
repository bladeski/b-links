import { LoaderItemModel } from '../models/LoaderItem.model';

class _LoaderService {
  private itemsLoading: LoaderItemModel[] = [];
  private hideLoaderTimeout?: NodeJS.Timeout;

  public setLoadItemState(item: LoaderItemModel) {
    if (item.isLoading) {
      !this.itemsLoading.some(
        (existingItem) =>
          existingItem.type === item.type && existingItem.id === item.id
      ) && this.itemsLoading.push(item);
    } else {
      const existingItem = this.itemsLoading.find(
        (existingItem) =>
          existingItem.type === item.type && existingItem.id === item.id
      );

      if (existingItem) {
        existingItem.isLoading = false;
      }
    }

    this.setLoaderItemList();

    this.setLoaderVisibility(
      this.itemsLoading.filter((existingItem) => existingItem.isLoading)
        .length > 0
    );
  }

  private setLoaderItemList() {
    const itemList = document.querySelector('#Loader .item-list');
    this.itemsLoading.forEach(item => {
      const node = itemList?.querySelector(`li[data-id="${item.type}-${item.id}"]`) as HTMLUListElement;

      if (node) {
        node.className = item.isLoading ? 'loading' : 'loaded';
      } else {
        const listItem = document.createElement('li');
        listItem.dataset.id = `${item.type}-${item.id}`;
        listItem.className = item.isLoading ? 'loading' : 'loaded';
        listItem.dataset.description = item.description;
        itemList?.appendChild(listItem);
      }
    })
  }

  private setLoaderVisibility(isVisible: boolean) {
    const loader = document.getElementById('Loader');
    const itemList = loader?.querySelector('.item-list');

    if (this.hideLoaderTimeout) {
      clearTimeout(this.hideLoaderTimeout);
    }

    if (isVisible) {
      loader?.classList.add('show');
    } else {
      this.hideLoaderTimeout = setTimeout(() => {
        loader?.classList.remove('show');
        this.itemsLoading = [];
        itemList?.replaceChildren();
  
        this.hideLoaderTimeout = undefined;
      }, 500);
    }

    
  }
}

const LoaderService = new _LoaderService();
export default LoaderService;
