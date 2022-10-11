import PreferenceService from './PreferenceService';

document.addEventListener('DOMContentLoaded', () => {
  performance.mark('Start app')
  console.debug(`You're running JavaScript... let's have some fun!`);

  new PreferenceService();
});
