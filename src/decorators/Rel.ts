import { $registeredRelationships } from "../data";
import { Model } from "../Model";

export function Rel(
  sourceKey?: string,
  options: { default?: any; parser?: (v: any) => any } = { parser: (v) => v }
) {
  return function _Rel<T extends Model>(klass: T, key: string) {
    let model = $registeredRelationships.find(
      (e) => e.klass === klass.constructor
    );
    if (!model) {
      model = { attributes: {}, klass: klass.constructor };
      $registeredRelationships.push(model);
    }

    model.attributes[sourceKey ?? key] = {
      parser: options.parser ?? ((v) => v),
      key,
      default: options.default,
    };
  };
}
