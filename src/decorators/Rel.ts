import { Model } from "../Model";
import { Parser } from "../Parser";

export function Rel(
  sourceKey?: string,
  options: { default?: any; parser?: (v: any) => any } = { parser: (v) => v }
) {
  return function _Rel<T extends Model>(klass: T, key: string) {
    let model = Parser.$registeredRelationships.find(
      (e) => e.klass === klass.constructor
    );
    if (!model) {
      model = { attributes: {}, klass: klass.constructor };
      Parser.$registeredRelationships.push(model);
    }

    model.attributes[sourceKey ?? key] = {
      parser: options.parser ?? ((v) => v),
      key,
      default: options.default,
    };
  };
}
