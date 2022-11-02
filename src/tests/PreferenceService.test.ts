import PreferenceService, { StylesheetNames } from '../scripts/services/PreferenceService';

beforeEach(() => {
  const dyslexicStyles = document.createElement('link');
  dyslexicStyles.id = StylesheetNames.DYSLEXIC_STYLES;
  document.head.appendChild(dyslexicStyles);
  
  const enhancedStyles = document.createElement('link');
  enhancedStyles.id = StylesheetNames.ENHANCED_STYLES;
  document.head.appendChild(enhancedStyles);

  const settings = document.createElement('div');
  settings.innerHTML = `
    <footer class="hide-settings">
      <form id="Preferences">
        <input type="checkbox" name="showDyslexicStyles" />
        <input type="checkbox" name="showEnhancedStyles" />
        <input type="range" name="themeColour" />
        <input type="radio" name="currentTheme" value="dark-mode" />
        <input type="radio" name="currentTheme" value="light-mode" />
        <input type="radio" name="currentTheme" value="" min="0" max="360" />
      </form>
      <span class="content"></span>
    </footer>
    <template id="SettingsButtonTemplate">
      <button id="SettingsButton" aria-label="Show settings">Settings</button>
    </template>
  `
  document.body.replaceChildren(settings);
});

describe('Preference service', () => {

  test('checking the show dyslexic styles button updates the stylesheet disabled property', () => {
    new PreferenceService();
    const checkbox = document.querySelector('[name="showDyslexicStyles"]') as HTMLInputElement;
    const stylesheet = document.querySelector(`#${StylesheetNames.DYSLEXIC_STYLES}`) as HTMLLinkElement;

    expect(stylesheet.disabled).toBe(true);

    checkbox?.click();

    expect(stylesheet.disabled).toBe(false);
  });

  test('checking the show dyslexic styles button updates the stylesheet disabled property', () => {
    new PreferenceService();
    const checkbox = document.querySelector('[name="showEnhancedStyles"]') as HTMLInputElement;
    const stylesheet = document.querySelector(`#${StylesheetNames.ENHANCED_STYLES}`) as HTMLLinkElement;

    expect(stylesheet.disabled).toBe(true);

    checkbox?.click();

    expect(stylesheet.disabled).toBe(false);
  });

  test('checking the show dyslexic styles button updates the localStorage settings', () => {
    const settingName = 'showDyslexicStyles';
    localStorage.setItem(settingName, 'false');
    
    new PreferenceService();
    const checkbox = document.querySelector(`[name="${settingName}"]`) as HTMLInputElement;

    expect(localStorage.getItem(settingName)).toBe('false');

    checkbox?.click();

    expect(localStorage.getItem(settingName)).toBe('true');
  });

  test('checking the show dyslexic styles button updates the localStorage settings', () => {
    const settingName = 'showEnhancedStyles';
    localStorage.setItem(settingName, 'false');
    
    new PreferenceService();
    const checkbox = document.querySelector(`[name="${settingName}"]`) as HTMLInputElement;

    expect(localStorage.getItem(settingName)).toBe('false');

    checkbox?.click();

    expect(localStorage.getItem(settingName)).toBe('true');
  });

  test('changing the theme colour range updates the localStorage settings', () => {
    const settingName = 'themeColour';
    localStorage.setItem(settingName, '230');
    
    new PreferenceService();
    const selector = document.querySelector(`[name="${settingName}"]`) as HTMLInputElement;

    expect(localStorage.getItem(settingName)).toBe('230');

    const event = new Event('input');
    selector.value = '50';
    selector.dispatchEvent(event);
    
    expect(localStorage.getItem(settingName)).toBe('50');
  });

  test('changing the theme toggle updates the localStorage settings', () => {
    const settingName = 'currentTheme';
    localStorage.setItem(settingName, '');
    
    new PreferenceService();
    const selector = document.querySelectorAll(`[name="${settingName}"]`) as NodeListOf<HTMLInputElement>;

    expect(localStorage.getItem(settingName)).toBe('');

    selector.forEach(node => {      
      node.click();
      expect(localStorage.getItem(settingName)).toBe(node.value);
    });
  });
  
});