import { RegisteredProperty } from "./RegisteredProperty";

export interface RegisteredAttribute {
  klass: any;
  attributes: Record<string, RegisteredProperty>;
}
