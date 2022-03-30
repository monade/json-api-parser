export interface RegisteredProperty {
  key: string;
  default?: any;
  parser: (value: any) => any;
}
