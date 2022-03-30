'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class Model {
  toJSON() {
    return { ...this
    };
  }

  toFormData() {
    const data = this.toJSON();
    const formData = new FormData();

    for (const key in data) {
      if (data[key] === null || data[key] === undefined) {
        continue;
      }

      if (Array.isArray(data[key])) {
        for (const value of data[key]) {
          formData.append(key + "[]", value);
        }
      } else if (data[key] instanceof File) {
        formData.append(key, data[key], data[key].filename);
      } else {
        formData.append(key, data[key]);
      }
    }

    return formData;
  }

}

function debug(...args) {
  debug.adapter(...args);
}

debug.adapter = (...args) => console.warn(...args);

class Parser {
  static $registeredModels = [];
  static $registeredAttributes = [];
  static $registeredRelationships = [];
  resolved = {};

  constructor(data, included = []) {
    this.data = data;
    this.included = included;
  }

  run() {
    if (!this.data) {
      return null;
    }

    const {
      data,
      included
    } = this;
    const fullIncluded = Array.isArray(data) ? [...data, ...included] : [data, ...included];
    return this.parse(data, fullIncluded);
  }

  parse(data, included = []) {
    if (!data) {
      return null;
    }

    if (Array.isArray(data)) {
      return this.parseList(data, included);
    } else if ("data" in data && !("id" in data)) {
      return this.parse(data.data, data.included || included);
    } else {
      return this.parseElement(data, included);
    }
  }

  parseList(list, included) {
    return list.map(e => {
      return this.parseElement(e, included);
    });
  }

  parseElement(element, included) {
    const uniqueKey = `${element.id}$${element.type}`;

    if (this.resolved[uniqueKey]) {
      return this.resolved[uniqueKey];
    }

    const loadedElement = Parser.load(element, included);
    const model = Parser.$registeredModels.find(e => e.type === loadedElement.type);
    const attrData = Parser.$registeredAttributes.find(e => e.klass === model?.klass);
    const relsData = Parser.$registeredRelationships.find(e => e.klass === model?.klass);
    const instance = new (model?.klass || Model)();
    this.resolved[uniqueKey] = instance;
    instance.id = loadedElement.id;

    for (const key in loadedElement.attributes) {
      const parser = attrData?.attributes?.[key];

      if (parser) {
        instance[parser.key] = parser.parser(loadedElement.attributes[key]);
      } else {
        instance[key] = loadedElement.attributes[key];
        debug(`Undeclared key "${key}" in "${loadedElement.type}"`);
      }
    }

    if (attrData) {
      for (const key in attrData.attributes) {
        const parser = attrData.attributes[key];

        if (!(parser.key in instance)) {
          if ("default" in parser) {
            instance[parser.key] = parser.default;
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
        instance[parser.key] = parser.parser(this.parse(relation, included));
      } else {
        instance[key] = this.parse(relation, included);
        debug(`Undeclared relationship "${key}" in "${loadedElement.type}"`);
      }
    }

    if (relsData) {
      for (const key in relsData.attributes) {
        const parser = relsData.attributes[key];

        if (!(parser.key in instance)) {
          if ("default" in parser) {
            instance[parser.key] = parser.default;
          } else {
            debug(`Missing relationships "${key}" in "${loadedElement.type}"`);
          }
        }
      }
    }

    return instance;
  }

  static load(element, included) {
    const found = included.find(e => e.id == element.id && e.type === element.type);

    if (!found) {
      debug(`Relationship with type ${element.type} with id ${element.id} not present in included`);
    }

    return found || { ...element,
      $_partial: true
    };
  }

}

function Attr(sourceKey, options = {
  parser: v => v
}) {
  return function _Attr(klass, key) {
    let model = Parser.$registeredAttributes.find(e => e.klass === klass.constructor);

    if (!model) {
      model = {
        attributes: {},
        klass: klass.constructor
      };
      Parser.$registeredAttributes.push(model);
    }

    const data = {
      parser: options.parser ?? (v => v),
      key
    };

    if ("default" in options) {
      data.default = options.default;
    }

    model.attributes[sourceKey ?? key] = data;
  };
}

function Rel(sourceKey, options = {
  parser: v => v
}) {
  return function _Rel(klass, key) {
    let model = Parser.$registeredRelationships.find(e => e.klass === klass.constructor);

    if (!model) {
      model = {
        attributes: {},
        klass: klass.constructor
      };
      Parser.$registeredRelationships.push(model);
    }

    model.attributes[sourceKey ?? key] = {
      parser: options.parser ?? (v => v),
      key,
      default: options.default
    };
  };
}

function JSONAPI(type) {
  return function _JSONAPI(constructor) {
    Parser.$registeredModels.push({
      klass: constructor,
      type
    });
  };
}

exports.Attr = Attr;
exports.JSONAPI = JSONAPI;
exports.Model = Model;
exports.Parser = Parser;
exports.Rel = Rel;
exports.debug = debug;
