import { RegisteredProperty } from "../interfaces/RegisteredProperty";
import { Model } from "../Model";
import { Parser } from "../Parser";

export function Attr(
  sourceKey?: string,
  options: { default?: any; parser?: (v: any) => any } = { parser: (v) => v }
) {
  return function _Attr<T extends Model>(klass: T, key: string) {
    let model = Parser.$registeredAttributes.find(
      (e) => e.klass === klass.constructor
    );
    if (!model) {
      model = { attributes: {}, klass: klass.constructor };
      Parser.$registeredAttributes.push(model);
    }

    const data: RegisteredProperty = {
      parser: options.parser ?? ((v) => v),
      key,
    };

    if ("default" in options) {
      data.default = options.default;
    }

    model.attributes[sourceKey ?? key] = data;
  };
}
