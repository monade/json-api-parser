import { Model } from "../Model";
import { Parser } from "../Parser";

export function JSONAPI(type: string) {
  return function _JSONAPI<T extends typeof Model>(constructor: T) {
    Parser.$registeredModels.push({
      klass: constructor,
      type,
    });
  };
}
