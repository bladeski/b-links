export default class PreferenceService {
  prefDefaults: Preferences = {
    showPreferences: false,
    showDyslexicStyles: false,
    showEnhancedStyles: false,
  };

  private currentPrefs: Preferences;
  private preferenceForm = document.forms.namedItem('Preferences');

  constructor() {
    performance.mark('Loading settings');
    this.currentPrefs = this.getPrefs();

    this.enableStyles(StylesheetNames.DYSLEXIC_STYLES, this.currentPrefs.showDyslexicStyles);
    this.enableStyles(StylesheetNames.ENHANCED_STYLES, this.currentPrefs.showEnhancedStyles);
    
    const settingsButton = document.getElementById('Settings') as HTMLButtonElement;
    settingsButton.disabled = false;
    settingsButton.ariaLabel = 'Show settings.';
    settingsButton.addEventListener('click', this.onSettingsClick.bind(this));

    this.initialiseForm();
  }

  private updatePref(prefName: keyof Preferences, value: boolean) {
    const prefs = { ...this.currentPrefs };
    prefs[prefName] = value;
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
        break;
    
      default:
        break;
    }
  }

  private getPrefs(): Preferences {
    const prefs: Preferences = {
      ...this.prefDefaults
    };
    (Object.keys(this.prefDefaults) as (keyof Preferences)[]).forEach((key) => {
      const value = localStorage.getItem(key)
      prefs[key] = value !== null ? value === 'true' : this.prefDefaults[key]
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

    // const enhancedStylesSelector = this.preferenceForm?.querySelector(
    //   '[name="showEnhancedStyles"]'
    // ) as HTMLInputElement;
    // enhancedStylesSelector.checked = prefs.showEnhancedStyles;
    // enhancedStylesSelector.addEventListener('click', (ev: MouseEvent) => {
    //   this.updatePref(
    //     'showEnhancedStyles',
    //     (ev.target as HTMLInputElement)?.checked
    //   );
    // });
    performance.mark('Loaded settings')
  }

  private onSettingsClick(ev: MouseEvent) {
    this.updatePref('showPreferences', !this.currentPrefs.showPreferences);
    (ev.currentTarget as HTMLButtonElement).textContent = `${this.currentPrefs.showPreferences ? 'Hide' : 'Show'} Settings`;
    (ev.currentTarget as HTMLButtonElement).ariaLabel = `${this.currentPrefs.showPreferences ? 'Hide' : 'Show'} settings`;
  }

  private showPreferences(show: boolean) {
    if (show) {
      this.preferenceForm?.classList.remove('hide');
    } else {
      this.preferenceForm?.classList.add('hide');
    }
  }

  private enableStyles(id: string, enable: boolean) {
    const sheet = document.getElementById(id) as HTMLLinkElement;
    sheet.disabled = !enable;
  }
}

enum StylesheetNames {
  DYSLEXIC_STYLES = 'DyslexicStyles',
  ENHANCED_STYLES = 'EnhancedStyles',
};

export type Preferences = {
  showPreferences: boolean;
  showDyslexicStyles: boolean;
  showEnhancedStyles: boolean;
};