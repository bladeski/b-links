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
    <footer>
      <form id="Preferences" class="hide">
        <input type="checkbox" name="showDyslexicStyles" />
        <input type="checkbox" name="showEnhancedStyles" />
      </form>
    </footer>
    <template id="SettingsButtonTemplate">
      <button id="SettingsButton">Settings</button>
    </template>
  `
  document.body.replaceChildren(settings);
});

describe('Preference service', () => {
  test('the settings button aria text changes on click', () => {
    new PreferenceService();
    const button = document.querySelector('button');

    expect(button?.ariaLabel).toContain('Show Settings');

    button?.click();

    expect(button?.ariaLabel).toBe('Hide Settings');

    button?.click();

    expect(button?.ariaLabel).toBe('Show Settings');
  });

  test('the preferences form shows on settings click', () => {
    new PreferenceService();
    const button = document.querySelector('button');
    const prefs = document.querySelector('#Preferences');

    expect(prefs?.classList).toContain('hide');

    button?.click();

    expect(prefs?.classList).not.toContain('hide');

    button?.click();

    expect(prefs?.classList).toContain('hide');
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