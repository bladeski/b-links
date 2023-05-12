import LoaderService from '../scripts/services/LoaderService';
import { LoaderType } from '../scripts/enums';

beforeEach(() => {
  document.body.innerHTML = `
    <div id="Loaders"></div>
  `;
});

describe('Loader service', () => {
  test('a loader is rendered', () => {
    const description = 'Test Style Sheet';
    LoaderService.setLoadItemState({
      type: LoaderType.STYLESHEET,
      description: description
    }, true);

    const loader = document.getElementById('Loaders')?.querySelector('.loader');
    expect(loader).toBeDefined();
    expect(loader?.textContent).toBe(`Loading ${description}`);
  });

  test('a loader is removed', () => {
    const description = 'Test Style Sheet';
    LoaderService.setLoadItemState({
      type: LoaderType.STYLESHEET,
      description: description
    }, true);

    LoaderService.setLoadItemState({
      type: LoaderType.STYLESHEET,
      description: description
    }, false);

    const loader = document.getElementById('Loaders')?.querySelector('.loader');
    expect(loader).toBeNull();
  });
});