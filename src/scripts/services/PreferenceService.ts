export default class PreferenceService {
  prefDefaults: Preferences = {
    showPreferences: false,
    showDyslexicStyles: false,
    showEnhancedStyles: false,
    themeColour: "314"
  };

  private currentPrefs: Preferences;
  private preferenceForm = document.forms.namedItem('Preferences');

  constructor() {
    this.currentPrefs = this.getPrefs();

    this.enableStyles(StylesheetNames.DYSLEXIC_STYLES, this.currentPrefs.showDyslexicStyles);
    this.enableStyles(StylesheetNames.ENHANCED_STYLES, this.currentPrefs.showEnhancedStyles);
    this.setThemeColour(this.currentPrefs.themeColour);
    this.toggleThemeColourPickerDisabled(!this.currentPrefs.showEnhancedStyles);
    
    this.setupSettingsButton();

    this.initialiseForm();
  }

  private setupSettingsButton() {
    const settingsButtonTemplate = document.getElementById('SettingsButtonTemplate') as HTMLTemplateElement;
    const content = settingsButtonTemplate.content.cloneNode(true) as HTMLElement;
    const footer = document.querySelector('footer span.content');
    footer?.appendChild(content);

    const settingsButton = document.getElementById('SettingsButton') as HTMLButtonElement;
    if (settingsButton) {
      settingsButton.disabled = false;
      settingsButton.ariaLabel = 'Show settings';
      settingsButton.addEventListener('click', this.onSettingsClick.bind(this));
    }
  }

  private updatePref(prefName: keyof Preferences, value: boolean | string) {
    const prefs = { ...this.currentPrefs };
    if (prefName === 'themeColour' && typeof value === 'string') {
      prefs[prefName] = value;
    } else if (prefName !== 'themeColour' && typeof value === 'boolean') {
      prefs[prefName] = value;
    }
    this.savePrefs(prefs);

    switch (prefName) {
      case 'showPreferences':
        this.showPreferences(prefs.showPreferences);
        break;
      case 'showDyslexicStyles':
        this.enableStyles(StylesheetNames.DYSLEXIC_STYLES, prefs.showDyslexicStyles);
        break;
      case 'showEnhancedStyles':
        this.enableStyles(StylesheetNames.ENHANCED_STYLES, prefs.showEnhancedStyles);
        this.toggleThemeColourPickerDisabled(!prefs.showEnhancedStyles);
        break;
      case 'themeColour':
        if (typeof value === 'string' && !isNaN(parseInt(value))) {
          this.setThemeColour(value);
        }
        
      default:
        break;
    }
  }

  private getPrefs(): Preferences {
    const prefs: Preferences = {
      ...this.prefDefaults
    };
    (Object.keys(this.prefDefaults) as (keyof Preferences)[]).forEach((key) => {
      const value = localStorage.getItem(key);
      if (key === 'themeColour') {
        prefs[key] = value || '';
      } else {
        prefs[key] = value !== null ? value === 'true' : this.prefDefaults[key];
      }
    });
  
    return prefs;
  }

  private savePrefs(prefs: Preferences) {
    (Object.keys(prefs) as (keyof Preferences)[]).forEach(key => {
      if (key !== 'showPreferences') {
        localStorage.setItem(key, `${prefs[key]}`);
      }
    });
    this.currentPrefs = prefs;
  }

  private initialiseForm() {
    const prefs = this.getPrefs();
    
    const dyslexicStyleSelector = this.preferenceForm?.querySelector(
      '[name="showDyslexicStyles"]'
    ) as HTMLInputElement;
    dyslexicStyleSelector.checked = prefs.showDyslexicStyles;
    dyslexicStyleSelector.addEventListener('click', (ev: MouseEvent) => {
      this.updatePref(
        'showDyslexicStyles',
        (ev.target as HTMLInputElement)?.checked
      );
    });

    const enhancedStylesSelector = this.preferenceForm?.querySelector(
      '[name="showEnhancedStyles"]'
    ) as HTMLInputElement;
    enhancedStylesSelector.checked = prefs.showEnhancedStyles;
    enhancedStylesSelector.addEventListener('click', (ev: MouseEvent) => {
      this.updatePref(
        'showEnhancedStyles',
        (ev.target as HTMLInputElement)?.checked
      );
    });

    const themeColourPicker = this.preferenceForm?.querySelector(
      '[name="themeColour"]'
    ) as HTMLInputElement;
    themeColourPicker.value = prefs.themeColour;
    themeColourPicker.addEventListener('input', (ev: Event) => {
      this.updatePref(
        'themeColour',
        (ev.target as HTMLInputElement)?.value
      );
    })
  }

  private onSettingsClick(ev: MouseEvent) {
    this.updatePref('showPreferences', !this.currentPrefs.showPreferences);
    // (ev.currentTarget as HTMLButtonElement).textContent = `${this.currentPrefs.showPreferences ? 'Hide' : 'Show'} Settings`;
    (ev.currentTarget as HTMLButtonElement).ariaLabel = `${this.currentPrefs.showPreferences ? 'Hide' : 'Show'} settings`;
  }

  private showPreferences(show: boolean) {
    const footer = document.querySelector('footer');
    if (show) {
      footer?.classList.remove('hide-settings');
    } else {
      footer?.classList.add('hide-settings');
    }
  }

  private enableStyles(id: string, enable: boolean) {
    const sheet = document.getElementById(id) as HTMLLinkElement;
    sheet.disabled = !enable;
  }

  private setThemeColour(colour: string) {
    document.documentElement.style.setProperty('--theme-hue-saturation', `${colour}, 71%`);
  }

  private toggleThemeColourPickerDisabled(disabled: boolean) {
    const themeColourPicker = this.preferenceForm?.querySelector(
      '[name="themeColour"]'
    ) as HTMLInputElement;
    themeColourPicker.disabled = disabled;
  }
  
}

export enum StylesheetNames {
  DYSLEXIC_STYLES = 'DyslexicStyles',
  ENHANCED_STYLES = 'EnhancedStyles',
};

export type Preferences = {
  showPreferences: boolean;
  showDyslexicStyles: boolean;
  showEnhancedStyles: boolean;
  themeColour: string;
};