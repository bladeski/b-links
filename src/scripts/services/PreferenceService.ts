import { LoaderItemModel, LoaderItemTypes } from '../models/LoaderItem.model';

import LoaderService from './LoaderService';
import { LoggingService } from './LoggingService';

export default class PreferenceService {
  prefDefaults: Preferences = {
    showPreferences: false,
    showDyslexicStyles: false,
    loadCustomFonts: false,
    currentTheme: ThemeOptions.NO_PREF,
    themeColour: '230',
  };

  private currentPrefs: Preferences;
  private preferenceForm = document.forms.namedItem('Preferences');

  constructor() {
    this.currentPrefs = this.getPrefs();

    this.enableStyles(
      StylesheetNames.DYSLEXIC_STYLES,
      this.currentPrefs.showDyslexicStyles
    );
    this.enableStyles(
      StylesheetNames.CUSTOM_FONTS,
      this.currentPrefs.loadCustomFonts
    );
    this.setThemeColour(this.currentPrefs.themeColour);
    this.setTheme(this.currentPrefs.currentTheme);

    this.initialiseForm();

    const loaderItem: LoaderItemModel = {
      type: LoaderItemTypes.FONTS,
      description: 'Fonts'
    };

    if (document.fonts) {
      document.fonts.onloading = () => {
        LoaderService.setLoadItemState(loaderItem, true);
      }
      document.fonts.onloadingdone = () => {
        LoaderService.setLoadItemState(loaderItem, false);
      }
    }

    this.hideUnsupportedSettings();
    this.checkWebFonts();
  }

  private hideUnsupportedSettings() {
    if (!window.CSS || !CSS.supports('color', 'var(--test)')) {
      this.toggleSetting('themeColour', false);
    }
  }

  private checkWebFonts() {
    const bodyStyles = window.getComputedStyle(document.body);
    const bodyFontStyle = `${bodyStyles.fontSize} ${bodyStyles.fontFamily.split(',')[0]}`;
    let titleFontAvailable = true;
    
    const title = document.querySelector('.title');
    if (title) {
      const titleStyles = window.getComputedStyle(title);
      const titleFontStyle = `${titleStyles.fontSize} ${bodyStyles.fontFamily.split(',')[0]}`;
      titleFontAvailable = document.fonts?.check(titleFontStyle);
    }
    
    if (document.fonts?.check(bodyFontStyle) || titleFontAvailable) {
      this.toggleSetting('loadCustomFonts', false);
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
        if (!prefs.showDyslexicStyles || !document.fonts?.check('12px OpenDyslexic')) {
          this.enableStyles(
            StylesheetNames.DYSLEXIC_STYLES,
            prefs.showDyslexicStyles
          );
        }
        break;
      case 'loadCustomFonts':
        if (!document.fonts?.check('12px Poppins') || !document.fonts?.check('12px Maven Pro')) {
          this.enableStyles(
            StylesheetNames.CUSTOM_FONTS,
            prefs.loadCustomFonts
          );
        }
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

    const settingsButton = document.querySelector('button.settings') as HTMLButtonElement;
    settingsButton.addEventListener('click', (ev: MouseEvent) => {
      this.updatePref(
        'showPreferences',
        !this.currentPrefs.showPreferences
      );
    });

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
      '[name="loadCustomFonts"]'
    ) as HTMLInputElement;
    enhancedStylesSelector.checked = prefs.loadCustomFonts;
    enhancedStylesSelector.addEventListener('click', (ev: MouseEvent) => {
      this.updatePref(
        'loadCustomFonts',
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

    this.savePrefs(prefs);
  }

  private showPreferences(show: boolean) {
    const settings = document.querySelector('#Preferences');
    if (show) {
      settings?.classList.remove('hide');
    } else {
      settings?.classList.add('hide');
    }
  }

  private enableStyles(id: StylesheetNames, enable: boolean) {
    const sheet = document.getElementById(id) as HTMLLinkElement;
    sheet.disabled = !enable;
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
    document.body.style.setProperty('--theme-hue', colour);
  }

  private toggleSetting(name: keyof Preferences, show: boolean) {
    const settings = this.preferenceForm?.querySelectorAll(
      `[name="${name}"]`
    ) as NodeListOf<HTMLInputElement>;
    settings.forEach((node) => {
      if (node.parentElement) {
        node.parentElement.style.display = show ? '' : 'none';
      }
    });
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
  CUSTOM_FONTS = 'CustomFonts',
}

enum ThemeOptions {
  DARK_MODE = 'dark-mode',
  LIGHT_MODE = 'light-mode',
  NO_PREF = '-',
}

export type Preferences = {
  showPreferences: boolean;
  showDyslexicStyles: boolean;
  loadCustomFonts: boolean;
  currentTheme: ThemeOptions;
  themeColour: string;
};
