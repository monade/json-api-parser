const $registeredModels = [];
const $registeredAttributes = [];
const $registeredRelationships = [];

class Model {
  toDTO() {
    const response = {
      ...this
    };
    delete response._type;
    const rels = $registeredRelationships.find(e => e.klass === this.constructor) ?? {
      attributes: {}
    };
    for (const key in response) {
      if (rels.attributes[key] || response[key] instanceof Model) {
        response[`${key}Id`] = response[key]?.id ?? null;
        delete response[key];
      }
    }
    return response;
  }
  toJSON(maxDepth = 100) {
    const response = {
      ...this
    };
    delete response._type;
    for (const key in response) {
      if (response[key] instanceof Model) {
        if (maxDepth <= 0) {
          delete response[key];
        } else {
          response[key] = response[key].toJSON(maxDepth - 1);
        }
      }
    }
    return response;
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

function debug(level, ...args) {
  debug.adapter(level, ...args);
}
debug.adapter = (level, ...args) => {
  switch (level) {
    case 'warn':
      console.warn(...args);
      break;
    case 'error':
      console.error(...args);
      break;
    case 'info':
    default:
      console.log(...args);
      break;
  }
};

class Parser {
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
    const model = $registeredModels.find(e => e.type === loadedElement.type);
    const instance = this.wrapWhenPartial(new (model?.klass || Model)(), loadedElement);
    this.resolved[uniqueKey] = instance;
    if (model && model.createFn) {
      return model.createFn(instance, loadedElement, relation => this.parse(relation, included));
    }
    const attrData = $registeredAttributes.find(e => e.klass === model?.klass);
    const relsData = $registeredRelationships.find(e => e.klass === model?.klass);
    instance.id = loadedElement.id;
    instance._type = loadedElement.type;
    this.parseAttributes(instance, loadedElement, attrData);
    this.parseRelationships(instance, loadedElement, relsData, included);
    return instance;
  }
  wrapWhenPartial(instance, loadedElement) {
    if (loadedElement.$_partial) {
      return new Proxy(instance, {
        get: function (target, prop) {
          if (prop in target) {
            return target[prop];
          }
          if (prop === "$_partial") {
            return true;
          }
          debug('error', `Trying to call property "${prop.toString()}" to a model that is not included. Add "${loadedElement.type}" to included models.`);
          return undefined;
        }
      });
    }
    return instance;
  }
  parseRelationships(instance, loadedElement, relsData, included) {
    for (const key in loadedElement.relationships) {
      const relation = loadedElement.relationships[key];
      const parser = relsData?.attributes?.[key];
      if (parser) {
        instance[parser.key] = parser.parser(this.parse(relation, included));
      } else {
        instance[key] = this.parse(relation, included);
        debug('warn', `Undeclared relationship "${key}" in "${loadedElement.type}"`);
      }
    }
    if (relsData) {
      for (const key in relsData.attributes) {
        const parser = relsData.attributes[key];
        if (!(parser.key in instance)) {
          if ("default" in parser) {
            instance[parser.key] = parser.default;
          } else {
            debug('warn', `Missing relationships "${key}" in "${loadedElement.type}"`);
          }
        }
      }
    }
  }
  parseAttributes(instance, loadedElement, attrData) {
    for (const key in loadedElement.attributes) {
      const parser = attrData?.attributes?.[key];
      if (parser) {
        instance[parser.key] = parser.parser(loadedElement.attributes[key]);
      } else {
        instance[key] = loadedElement.attributes[key];
        debug('warn', `Undeclared key "${key}" in "${loadedElement.type}"`);
      }
    }
    if (attrData) {
      for (const key in attrData.attributes) {
        const parser = attrData.attributes[key];
        if (!(parser.key in instance)) {
          if ("default" in parser) {
            instance[parser.key] = parser.default;
          } else {
            debug('warn', `Missing attribute "${key}" in "${loadedElement.type}"`);
          }
        }
      }
    }
  }
  static load(element, included) {
    const found = included.find(e => e.id == element.id && e.type === element.type);
    if (!found) {
      debug('info', `Relationship with type ${element.type} with id ${element.id} not present in included`);
    }
    return found || {
      ...element,
      $_partial: true
    };
  }
}

function Attr(sourceKey, options = {
  parser: v => v
}) {
  return function _Attr(klass, key) {
    let model = $registeredAttributes.find(e => e.klass === klass.constructor);
    if (!model) {
      model = {
        attributes: {},
        klass: klass.constructor
      };
      $registeredAttributes.push(model);
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
    let model = $registeredRelationships.find(e => e.klass === klass.constructor);
    if (!model) {
      model = {
        attributes: {},
        klass: klass.constructor
      };
      $registeredRelationships.push(model);
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
    $registeredModels.push({
      klass: constructor,
      type
    });
  };
}

export { Attr, JSONAPI, Model, Parser, Rel, debug };
