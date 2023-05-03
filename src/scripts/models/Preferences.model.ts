import { Preference } from '../enums/Preference.enum';
import { ThemeOptions } from '../enums/ThemeOptions.enum';

export type Preferences = {
  [Preference.SHOW_PREFERENCES]: boolean;
  [Preference.SHOW_DYSLEXIC_STYLES]: boolean;
  [Preference.LOAD_CUSTOM_FONTS]: boolean;
  [Preference.CURRENT_THEME]: ThemeOptions;
  [Preference.THEME_COLOUR]: string;
};