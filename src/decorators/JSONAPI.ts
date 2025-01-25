import { $registeredModels } from "../data";
import { Model } from "../Model";

export function JSONAPI(type: string) {
  return function _JSONAPI<T extends typeof Model>(constructor: T) {
    $registeredModels.push({
      klass: constructor,
      type,
    });
  };
}
