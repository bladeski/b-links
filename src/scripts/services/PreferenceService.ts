import { LoaderItemModel, LoaderItemTypes } from '../models/LoaderItem.model';

import LoaderService from './LoaderService';
import { LoggingService } from './LoggingService';

export default class PreferenceService {
  prefDefaults: Preferences = {
    showPreferences: false,
    showDyslexicStyles: false,
    showEnhancedStyles: false,
    currentTheme: ThemeOptions.NO_PREF,
    themeColour: '230',
  };

  private currentPrefs: Preferences;
  private preferenceForm = document.forms.namedItem('Preferences');
  private loadedStylesheets: string[] = [];

  constructor() {
    this.currentPrefs = this.getPrefs();

    this.enableStyles(
      StylesheetNames.DYSLEXIC_STYLES,
      this.currentPrefs.showDyslexicStyles
    );
    this.enableStyles(
      StylesheetNames.ENHANCED_STYLES,
      this.currentPrefs.showEnhancedStyles
    );
    this.setThemeColour(this.currentPrefs.themeColour);
    this.setTheme(this.currentPrefs.currentTheme);

    this.toggleEnhancedSettings(this.currentPrefs.showEnhancedStyles);

    this.updatePref('showPreferences', true);

    this.initialiseForm();

    const loaderItem: LoaderItemModel = {
      type: LoaderItemTypes.FONTS,
      description: 'Fonts',
      isLoading: true
    };

    if (document.fonts) {
      document.fonts.onloading = () => {
        loaderItem.isLoading = true;
        LoaderService.setLoadItemState(loaderItem);
      }
      document.fonts.onloadingdone = () => {
        loaderItem.isLoading = false;
        LoaderService.setLoadItemState(loaderItem);
      }
    }
  }

  private updatePref(prefName: keyof Preferences, value: boolean | string) {
    const prefs = { ...this.currentPrefs };

    switch (prefName) {
      case 'themeColour':
        prefs[prefName] = value.toString();
        break;
      case 'currentTheme':
        prefs[prefName] = value as ThemeOptions;
        break;

      default:
        prefs[prefName] = !!value;
        break;
    }

    this.savePrefs(prefs);

    switch (prefName) {
      case 'showPreferences':
        this.showPreferences(prefs.showPreferences);
        break;
      case 'showDyslexicStyles':
        this.enableStyles(
          StylesheetNames.DYSLEXIC_STYLES,
          prefs.showDyslexicStyles
        );
        break;
      case 'showEnhancedStyles':
        this.enableStyles(
          StylesheetNames.ENHANCED_STYLES,
          prefs.showEnhancedStyles
        );
        this.toggleEnhancedSettings(prefs.showEnhancedStyles);
        break;
      case 'currentTheme':
        this.setTheme(prefs.currentTheme);
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
      ...this.prefDefaults,
    };
    (Object.keys(this.prefDefaults) as (keyof Preferences)[]).forEach((key) => {
      const value = localStorage.getItem(key) || '';

      switch (key) {
        case 'themeColour':
          prefs[key] = value;
          break;
        case 'currentTheme':
          prefs[key] = value as ThemeOptions;
          break;

        default:
          prefs[key] =
            value !== null ? value === 'true' : this.prefDefaults[key];
          break;
      }
    });

    return this.sanitisePrefs(prefs);
  }

  private savePrefs(prefs: Preferences) {
    const sanitisedPrefs = this.sanitisePrefs(prefs);
    (Object.keys(sanitisedPrefs) as (keyof Preferences)[]).forEach((key) => {
      if (key !== 'showPreferences') {
        localStorage.setItem(key, `${sanitisedPrefs[key]}`);
      }
    });
    this.currentPrefs = sanitisedPrefs;
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

    const themeSelector = this.preferenceForm?.querySelectorAll(
      '[name="currentTheme"]'
    ) as NodeListOf<HTMLInputElement>;
    themeSelector.forEach((node) => {
      if (node.value === prefs.currentTheme) {
        node.checked = true;
      }
      node.addEventListener('change', (ev: Event) => {
        this.updatePref('currentTheme', (ev.target as HTMLInputElement)?.value);
      });
    });

    const themeColourPicker = this.preferenceForm?.querySelector(
      '[name="themeColour"]'
    ) as HTMLInputElement;
    themeColourPicker.value = prefs.themeColour;
    themeColourPicker.addEventListener('input', (ev: Event) => {
      this.updatePref('themeColour', (ev.target as HTMLInputElement)?.value);
    });
  }

  private showPreferences(show: boolean) {
    const footer = document.querySelector('footer');
    if (show) {
      footer?.classList.remove('hide-settings');
    } else {
      footer?.classList.add('hide-settings');
    }
  }

  private enableStyles(id: StylesheetNames, enable: boolean) {
    const loaderItem: LoaderItemModel = {
      type: LoaderItemTypes.STYLESHEET,
      id: id,
      description: `${id.split('Styles')[0]} Styles`,
      isLoading: true
    };
    if (enable && !this.loadedStylesheets.some(sheet => sheet === id)) {
      LoaderService.setLoadItemState(loaderItem);
    }
    const sheet = document.getElementById(id) as HTMLLinkElement;
    sheet.disabled = !enable;

    sheet.onload = () => {
      this.loadedStylesheets.push(id);
      setTimeout(() => {
        loaderItem.isLoading = false;
        LoaderService.setLoadItemState(loaderItem);
      });
    };
  }

  private sanitisePrefs(prefs: Preferences): Preferences {
    const sanitisedPrefs = { ...this.prefDefaults };
    (Object.keys(sanitisedPrefs) as (keyof Preferences)[]).forEach((pref) => {
      switch (pref) {
        case 'themeColour':
          sanitisedPrefs[pref] = this.sanitiseThemeColour(prefs[pref]);
          break;
        case 'currentTheme':
          sanitisedPrefs[pref] = this.sanitiseThemeName(prefs[pref]);
          break;

        default:
          sanitisedPrefs[pref] = this.sanitiseOther(pref, prefs[pref]);
          break;
      }
    });

    return sanitisedPrefs;
  }

  private sanitiseThemeColour(colour: string | null): string {
    const colourValue = parseInt(colour || this.prefDefaults.themeColour) % 360;
    if (isNaN(colourValue)) {
      LoggingService.logInvalidSettingEvent('themeColour', colour || '');
      return this.prefDefaults.themeColour;
    }
    return `${colourValue < 0 ? 360 - colourValue : colourValue}`;
  }

  private sanitiseThemeName(theme: string | null): ThemeOptions {
    switch (theme) {
      case ThemeOptions.DARK_MODE:
      case ThemeOptions.LIGHT_MODE:
      case ThemeOptions.NO_PREF:
        return theme;

      default:
        LoggingService.logInvalidSettingEvent('currentTheme', theme || '');
        return ThemeOptions.NO_PREF;
    }
  }

  private sanitiseOther(key: keyof Preferences, value: boolean): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    LoggingService.logInvalidSettingEvent(key, value);
    return !!this.prefDefaults[key];
  }

  private setThemeColour(colour: string) {
    document.body.style.setProperty('--theme-hue-saturation', `${colour}, 71%`);
  }

  private toggleEnhancedSettings(show: boolean) {
    const toggleDarkMode = this.preferenceForm?.querySelectorAll(
      '[name="currentTheme"]'
    ) as NodeListOf<HTMLInputElement>;
    toggleDarkMode.forEach((node) => (node.disabled = !show));

    const themeColourPicker = this.preferenceForm?.querySelector(
      '[name="themeColour"]'
    ) as HTMLInputElement;
    themeColourPicker.disabled = !show;
  }

  private setTheme(theme: ThemeOptions) {
    if (theme === ThemeOptions.DARK_MODE) {
      document.body.classList.remove(ThemeOptions.LIGHT_MODE);
      document.body.classList.add(ThemeOptions.DARK_MODE);
    } else if (theme === ThemeOptions.LIGHT_MODE) {
      document.body.classList.remove(ThemeOptions.DARK_MODE);
      document.body.classList.add(ThemeOptions.LIGHT_MODE);
    } else {
      document.body.classList.remove(ThemeOptions.LIGHT_MODE);
      document.body.classList.remove(ThemeOptions.DARK_MODE);
    }
  }
}

export enum StylesheetNames {
  DYSLEXIC_STYLES = 'DyslexicStyles',
  ENHANCED_STYLES = 'EnhancedStyles',
}

enum ThemeOptions {
  DARK_MODE = 'dark-mode',
  LIGHT_MODE = 'light-mode',
  NO_PREF = '-',
}

export type Preferences = {
  showPreferences: boolean;
  showDyslexicStyles: boolean;
  showEnhancedStyles: boolean;
  currentTheme: ThemeOptions;
  themeColour: string;
};
