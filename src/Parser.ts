import { JSONData } from "./interfaces/JSONData";
import { JSONModel } from "./interfaces/JSONModel";
import { RegisteredAttribute } from "./interfaces/RegisteredAttribute";
import { RegisteredProperty } from "./interfaces/RegisteredProperty";
import { Model } from "./Model";
import { $registeredAttributes, $registeredModels, $registeredRelationships } from "./data";
import { debug } from "./utils";

export class Parser {
  readonly resolved: Record<string, Model> = {};

  constructor(
    private data: JSONModel[] | JSONModel,
    private included: JSONModel[] = []
  ) {}

  run<T>(): T | T[] | null {
    if (!this.data) {
      return null;
    }
    const { data, included } = this;

    const fullIncluded = Array.isArray(data)
      ? [...data, ...included]
      : [data, ...included];

    return this.parse(data, fullIncluded);
  }

  private parse<T>(
    data: JSONData | JSONModel[] | JSONModel | null,
    included: JSONModel[] = []
  ): T | T[] | null {
    if (!data) {
      return null;
    }

    if (Array.isArray(data)) {
      return this.parseList(data, included) as T[];
    } else if ("data" in data && !("id" in data)) {
      return this.parse(data.data, data.included || included);
    } else {
      return this.parseElement(data as JSONModel, included);
    }
  }

  parseList(list: JSONModel[], included: JSONModel[]) {
    return list.map((e) => {
      return this.parseElement(e, included);
    });
  }

  parseElement<T>(element: JSONModel, included: JSONModel[]): T {
    const uniqueKey = `${element.id}$${element.type}`;
    if (this.resolved[uniqueKey]) {
      return this.resolved[uniqueKey] as T;
    }

    const loadedElement = Parser.load(element, included);

    const model = $registeredModels.find(
      (e) => e.type === loadedElement.type
    );

    const instance = this.wrapWhenPartial(new (model?.klass || Model)(), loadedElement);
    this.resolved[uniqueKey] = instance;

    if (model && model.createFn) {
      return model.createFn(instance, loadedElement, (relation) => this.parse(relation, included)) as T;
    }

    const attrData = $registeredAttributes.find(
      (e) => e.klass === model?.klass
    );
    const relsData = $registeredRelationships.find(
      (e) => e.klass === model?.klass
    );

    instance.id = loadedElement.id;
    instance._type = loadedElement.type;

    this.parseAttributes(instance, loadedElement, attrData);
    this.parseRelationships(instance, loadedElement, relsData, included);

    return instance as T;
  }

  wrapWhenPartial(instance: Model, loadedElement: JSONModel & { $_partial?: boolean }) {
    if (loadedElement.$_partial) {
      return new Proxy(
        instance,
        {
          get: function<T extends object>(target: T, prop: keyof T) {
            if (prop in target) {
              return target[prop];
            }
            if (prop === "$_partial") {
              return true;
            }
            debug('error', `Trying to call property "${prop.toString()}" to a model that is not included. Add "${loadedElement.type}" to included models.`);
            return undefined;
          },
        })
    }

    return instance;
  }

  private parseRelationships(instance: Model, loadedElement: JSONModel, relsData: RegisteredAttribute | undefined, included: JSONModel[]) {
    for (const key in loadedElement.relationships) {
      const relation = loadedElement.relationships[key];
      const parser = relsData?.attributes?.[key];
      if (parser) {
        (instance as any)[parser.key] = parser.parser(
          this.parse(relation, included)
        );
      } else {
        (instance as any)[key] = this.parse(relation, included);
        debug('warn', `Undeclared relationship "${key}" in "${loadedElement.type}"`);
      }
    }

    if (relsData) {
      for (const key in relsData.attributes) {
        const parser: RegisteredProperty = relsData.attributes[key];
        if (!(parser.key in instance)) {
          if ("default" in parser) {
            (instance as any)[parser.key] = parser.default;
          } else {
            debug('warn', `Missing relationships "${key}" in "${loadedElement.type}"`);
          }
        }
      }
    }
  }

  private parseAttributes(instance: Model, loadedElement: JSONModel, attrData: RegisteredAttribute | undefined) {
    for (const key in loadedElement.attributes) {
      const parser = attrData?.attributes?.[key];
      if (parser) {
        (instance as any)[parser.key] = parser.parser(
          loadedElement.attributes[key]
        );
      } else {
        (instance as any)[key] = loadedElement.attributes[key];
        debug('warn', `Undeclared key "${key}" in "${loadedElement.type}"`);
      }
    }

    if (attrData) {
      for (const key in attrData.attributes) {
        const parser: RegisteredProperty = attrData.attributes[key];
        if (!(parser.key in instance)) {
          if ("default" in parser) {
            (instance as any)[parser.key] = parser.default;
          } else {
            debug('warn', `Missing attribute "${key}" in "${loadedElement.type}"`);
          }
        }
      }
    }
  }

  static load(element: JSONModel, included: JSONModel[]) {
    const found = included.find(
      (e) => e.id == element.id && e.type === element.type
    );
    if (!found) {
      debug(
        'info', `Relationship with type ${element.type} with id ${element.id} not present in included`
      );
    }

    return found || { ...element, $_partial: true };
  }
}
