
export type PageLoadFunction = (group: SettingGroup[]) => Promise<void>;
export type ValidationFunction = (value: any, setting: Setting) => string | void;
export type FormatFunction = () => any;

// Indicates the distinct type of the setting. Impacts the visual rendering of the setting, as well
//  as functionality (eg: BUTTON types are ignored when performing save functionality)
export enum SettingType {
  STRING = 0,
  NUMBER = 1,
  BOOLEAN = 2,
  SELECT = 3,
  BUTTON = 4
}

// Details needed to render <option> elements
export class SelectableOption {
  text: string;
  value: any;
  isDisabled: boolean;
}

// Render options for the SettingType.NUMBER type
export class ParamsNumber {
  min: number;
  max: number;
  step: number;
}

// Render options for the SettingType.STRING type
export class ParamsString {
  placeholder: string;
}

// Render options for the SettingType.BUTTON type
export class ParamsButton {
  icon: string;
  color: string;
}

// Defines a Setting item
export class Setting {
  id: string;                     // Easy identification of the setting (typically the SettingState service id, useful for when saving)
  title: string;                  // the primary text displayed to the user (or the button text for SettingType.BUTTON items)
  description: string;            // Additional help/description tex tfor this particular setting
  isDisabled: boolean;            // Where to render the setting as disabled
  type: SettingType;              // The specific type of the setting
  limits: null | ParamsNumber | ParamsString | ParamsButton;  // Additional (optional) type specific render options
  errorMsg?: string;              // Error message text indicating an error with this particular setting
  options?: SelectableOption[];   // Only applicable if type === SettingType.SELECT : the options for the select item
  currentValue: any;              // The current saved value for this setting. Ignored for SettingType.BUTTON
  newValue: any;                  // The new, unsaved value that the user wants. Otherwise contains the same value as the current value.
  tags: string[];                 // A list of tags to display for the setting. Typically draws attention to additional, useful info.
  restartRequired: boolean;       // Indicates whether a restart of a particular service or the applicaiton as a whole is required.
  validate?: ValidationFunction;  // Optional validation function that is executed when the user changes the value.
                                  //  The validation function gets a copy of the new value.
                                  //  Executed when the page save function is called to ensure the changed 'newvalue' is actually valid.
  onChange?: ValidationFunction;  // Optional function executed when the setting is changed.
                                  //  Similar to the validation function, but run after validation.
                                  //  NOT executed when the page save function is called.
  formatValue?: FormatFunction;   // Optional function executed to format the setting when changing it.
                                  //  Applied on field value change only before other values are applied.
}

// Provides a means to group together similar settings.
export class SettingGroup {
  id?: string;                    // Easy identification of the setting group (eg: when saving)
  name: string;
  icon: string;
  settings: Setting[];            // The settings in this group
  errors: number[];
}

// Additional information applicable to the content of the page (rendered as a tab on the Settings page)
export class PageInfo {
  title: string;
  description: string;
  help: string;
}

// Convenience means for defining text content for loading/waiting/error messages
export enum TextContent {
  LOADING = 'Loading applicable settings',
  SAVING = 'Performing requested updates',
  RESET = 'Resetting unsaved changes',
  ERROR_BUSY_PROCESSING = 'Changes not saved!',
  ERROR_INVALID_ITEMS = 'Please correct errors before attempting to save',
  SAVE_SUCCESSFUL = 'Successfully applied changes',
  SAVE_FAILED = 'Failed to apply selected changes',
  SAVE_NOT_NEEDED = 'Aborting save as no changes have been made',
  RESTARTING_APPLICATION = 'Please wait while the application restarts'
}
