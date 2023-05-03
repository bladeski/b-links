import { LoaderItemModel, Preferences } from '../models';
import { LoaderType, Preference, StylesheetNames, ThemeOptions } from '../enums';

import { ElementSelector } from '../enums/ElementSelector.enum';
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
  private preferenceForm = document.forms.namedItem(ElementSelector.PREF_FORM_ID);

  constructor() {
    this.currentPrefs = this.getPrefs();

    this.enableStyles(
      StylesheetNames.DYSLEXIC_STYLES,
      this.currentPrefs.showDyslexicStyles
    );
    this.setThemeColour(this.currentPrefs.themeColour);
    this.setTheme(this.currentPrefs.currentTheme);
    if (this.checkWebFontsLoaded()) {
      this.toggleSetting(Preference.LOAD_CUSTOM_FONTS, false);
    }

    this.showSettingsButton();
    this.initialiseForm();

    const loaderItem: LoaderItemModel = {
      type: LoaderType.FONTS,
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
    LoaderService.setMask();
  }

  private showSettingsButton(show = true) {
    const button = document.querySelector(ElementSelector.PREF_TOGGLE_CLASS);
    
    if (button && show) {
      button.classList.remove('hide');
    } else if (button) {
      button.classList.add('hide');
    }
  }

  private hideUnsupportedSettings() {
    if (!window.CSS || !CSS.supports('color', 'var(--test)')) {
      this.toggleSetting(Preference.THEME_COLOUR, false);
    }
  }

  private checkWebFontsLoaded(): boolean {
    const bodyStyles = window.getComputedStyle(document.body);
    const bodyFontStyle = `${bodyStyles.fontSize} ${bodyStyles.fontFamily.split(',')[0]}`;
    const bodyFontAvailable = document.fonts?.check(bodyFontStyle);

    let headerFontAvailable = true;
    
    const header = document.querySelector(ElementSelector.TITLE_CLASS);
    if (header) {
      const headerStyles = window.getComputedStyle(header);
      const headerFontStyle = `${headerStyles.fontSize} ${bodyStyles.fontFamily.split(',')[0]}`;
      headerFontAvailable = document.fonts?.check(headerFontStyle);
    }

    if (!headerFontAvailable) {
      this.enableStyles(
        StylesheetNames.HEADER_FONT,
        this.currentPrefs.loadCustomFonts
      );
    }
    if (!bodyFontAvailable) {
      this.enableStyles(
        StylesheetNames.BODY_FONT,
        this.currentPrefs.loadCustomFonts
      );
    }

    return bodyFontAvailable && headerFontAvailable;
  }

  private updatePref(prefName: Preference, value: boolean | string) {
    const prefs = { ...this.currentPrefs };

    switch (prefName) {
      case Preference.THEME_COLOUR:
        prefs[prefName] = value.toString();
        break;
      case Preference.CURRENT_THEME:
        prefs[prefName] = value as ThemeOptions;
        break;

      default:
        prefs[prefName] = !!value;
        break;
    }

    this.savePrefs(prefs);

    switch (prefName) {
      case Preference.SHOW_PREFERENCES:
        this.showPreferences(prefs.showPreferences);
        break;
      case Preference.SHOW_DYSLEXIC_STYLES:        
        this.enableStyles(
          StylesheetNames.DYSLEXIC_STYLES,
          prefs.showDyslexicStyles
        );
        break;
      case Preference.LOAD_CUSTOM_FONTS:
        this.checkWebFontsLoaded();
        break;
      case Preference.CURRENT_THEME:
        this.setTheme(prefs.currentTheme);
        break;
      case Preference.THEME_COLOUR:
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
        case Preference.THEME_COLOUR:
          prefs[key] = value;
          break;
        case Preference.CURRENT_THEME:
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
      if (key !== Preference.SHOW_PREFERENCES) {
        localStorage.setItem(key, `${sanitisedPrefs[key]}`);
      }
    });
    this.currentPrefs = sanitisedPrefs;
  }

  private initialiseForm() {
    const prefs = this.getPrefs();

    const settingsButton = document.querySelector(ElementSelector.PREF_TOGGLE_CLASS) as HTMLButtonElement;
    settingsButton.addEventListener('click', (ev: MouseEvent) => {
      this.updatePref(
        Preference.SHOW_PREFERENCES,
        !this.currentPrefs.showPreferences
      );
    });

    const dyslexicStyleSelector = this.preferenceForm?.querySelector(
      '[name="showDyslexicStyles"]'
    ) as HTMLInputElement;
    dyslexicStyleSelector.checked = prefs.showDyslexicStyles;
    dyslexicStyleSelector.addEventListener('click', (ev: MouseEvent) => {
      this.updatePref(
        Preference.SHOW_DYSLEXIC_STYLES,
        (ev.target as HTMLInputElement)?.checked
      );
    });

    const enhancedStylesSelector = this.preferenceForm?.querySelector(
      '[name="loadCustomFonts"]'
    ) as HTMLInputElement;
    enhancedStylesSelector.checked = prefs.loadCustomFonts;
    enhancedStylesSelector.addEventListener('click', (ev: MouseEvent) => {
      this.updatePref(
        Preference.LOAD_CUSTOM_FONTS,
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
        this.updatePref(Preference.CURRENT_THEME, (ev.target as HTMLInputElement)?.value);
      });
    });

    const themeColourPicker = this.preferenceForm?.querySelector(
      '[name="themeColour"]'
    ) as HTMLInputElement;
    themeColourPicker.value = prefs.themeColour;
    themeColourPicker.addEventListener('input', (ev: Event) => {
      this.updatePref(Preference.THEME_COLOUR, (ev.target as HTMLInputElement)?.value);
    });

    this.savePrefs(prefs);
  }

  private showPreferences(show: boolean) {
    if (show) {
      this.preferenceForm?.classList.remove('hide');
    } else {
      this.preferenceForm?.classList.add('hide');
    }
  }

  private enableStyles(id: StylesheetNames, enable: boolean) {
    const sheet = document.getElementById(id) as HTMLLinkElement;
    
    if (sheet) {
      sheet.disabled = !enable;
    }
  }

  private sanitisePrefs(prefs: Preferences): Preferences {
    const sanitisedPrefs = { ...this.prefDefaults };
    (Object.keys(sanitisedPrefs) as (keyof Preferences)[]).forEach((pref) => {
      switch (pref) {
        case Preference.THEME_COLOUR:
          sanitisedPrefs[pref] = this.sanitiseThemeColour(prefs[pref]);
          break;
        case Preference.CURRENT_THEME:
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
      LoggingService.logInvalidSettingEvent(Preference.THEME_COLOUR, colour || '');
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
        LoggingService.logInvalidSettingEvent(Preference.CURRENT_THEME, theme || '');
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
