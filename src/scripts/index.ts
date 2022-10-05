import PreferenceService from './PreferenceService';

window.onload = () => {
  performance.mark('Start app')
  console.log(`You're running JavaScript... let's have some fun!`);

  const preferenceService = new PreferenceService();

};
