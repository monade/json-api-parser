import { JSONData } from "./interfaces/JSONData";
import { JSONModel } from "./interfaces/JSONModel";
import { RegisteredAttribute } from "./interfaces/RegisteredAttribute";
import { RegisteredModel } from "./interfaces/RegisteredModel";
import { RegisteredProperty } from "./interfaces/RegisteredProperty";
import { Model } from "./Model";
import { debug } from "./utils";

export class Parser {
  static $registeredModels: RegisteredModel[] = [];
  static $registeredAttributes: RegisteredAttribute[] = [];
  static $registeredRelationships: RegisteredAttribute[] = [];

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
      return this.parseElement(data, included) as T;
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
      return this.resolved[uniqueKey] as any;
    }

    const loadedElement = Parser.load(element, included);

    const model = Parser.$registeredModels.find(
      (e) => e.type === loadedElement.type
    );
    const attrData = Parser.$registeredAttributes.find(
      (e) => e.klass === model?.klass
    );
    const relsData = Parser.$registeredRelationships.find(
      (e) => e.klass === model?.klass
    );

    const instance = new (model?.klass || Model)();

    this.resolved[uniqueKey] = instance;

    instance.id = loadedElement.id;
    for (const key in loadedElement.attributes) {
      const parser = attrData?.attributes?.[key];
      if (parser) {
        (instance as any)[parser.key] = parser.parser(
          loadedElement.attributes[key]
        );
      } else {
        (instance as any)[key] = loadedElement.attributes[key];
        debug(`Undeclared key "${key}" in "${loadedElement.type}"`);
      }
    }

    if (attrData) {
      for (const key in attrData.attributes) {
        const parser: RegisteredProperty = attrData.attributes[key];
        if (!(parser.key in instance)) {
          if ("default" in parser) {
            (instance as any)[parser.key] = parser.default;
          } else {
            debug(`Missing attribute "${key}" in "${loadedElement.type}"`);
          }
        }
      }
    }

    for (const key in loadedElement.relationships) {
      const relation = loadedElement.relationships[key];
      const parser = relsData?.attributes?.[key];
      if (parser) {
        (instance as any)[parser.key] = parser.parser(
          this.parse(relation, included)
        );
      } else {
        (instance as any)[key] = this.parse(relation, included);
        debug(`Undeclared relationship "${key}" in "${loadedElement.type}"`);
      }
    }

    if (relsData) {
      for (const key in relsData.attributes) {
        const parser: RegisteredProperty = relsData.attributes[key];
        if (!(parser.key in instance)) {
          if ("default" in parser) {
            (instance as any)[parser.key] = parser.default;
          } else {
            debug(`Missing relationships "${key}" in "${loadedElement.type}"`);
          }
        }
      }
    }

    return instance as any;
  }

  static load(element: JSONModel, included: JSONModel[]) {
    const found = included.find(
      (e) => e.id == element.id && e.type === element.type
    );
    if (!found) {
      debug(
        `Relationship with type ${element.type} with id ${element.id} not present in included`
      );
    }

    return found || { ...element, $_partial: true };
  }
}
