
export interface SettingField<T> {
  title: string;
  description: string;
  placeholder: string;
  isDisabled: boolean;
  value: T;
  defaultValue: T;
  tags: string[];
  requiresRestart: boolean;
  updateValue: (newValue: T) => void;
}