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
  test('the settings button aria text changes on click', () => {
    new PreferenceService();
    const button = document.querySelector('#SettingsButton') as HTMLButtonElement;

    expect(button?.ariaLabel).toContain('Show settings');

    button?.click();

    expect(button?.ariaLabel).toBe('Hide settings');

    button?.click();

    expect(button?.ariaLabel).toBe('Show settings');
  });

  test('the preferences form shows on settings click', () => {
    new PreferenceService();
    const button = document.querySelector('footer button') as HTMLButtonElement;
    const footer = document.querySelector('footer');

    expect(footer?.classList).toContain('hide-settings');

    button?.click();

    expect(footer?.classList).not.toContain('hide-settings');

    button?.click();

    expect(footer?.classList).toContain('hide-settings');
  });

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
  
});