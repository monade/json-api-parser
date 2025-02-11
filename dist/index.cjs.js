'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

const DEBUG = {
  ACCESSING_NOT_INCLUDED_MODEL: 'ACCESSING_NOT_INCLUDED_MODEL',
  UNDECLARED_RELATIONSHOP: 'UNDECLARED_RELATIONSHOP',
  MISSING_RELATIONSHIP: 'MISSING_RELATIONSHIP',
  UNDECLARED_ATTRIBUTE: 'UNDECLARED_ATTRIBUTE',
  MISSING_ATTRIBUTE: 'MISSING_ATTRIBUTE',
  SKIPPED_INCLUDED_RELATIONSHIP: 'SKIPPED_INCLUDED_RELATIONSHIP'
};
function debug(level, message, meta) {
  debug.adapter(level, message, meta);
}
debug.adapter = (level, message, meta) => {
  switch (level) {
    case 'warn':
      console.warn(message, meta);
      break;
    case 'error':
      console.error(message, meta);
      break;
    case 'info':
    default:
      console.log(message, meta);
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
    const instance = this.wrapWhenPartial(model, loadedElement);
    this.resolved[uniqueKey] = instance;
    if (model && model.createFn) {
      return model.createFn(instance, loadedElement, relation => this.parse(relation, included));
    }
    instance.id = loadedElement.id;
    instance._type = loadedElement.type;
    if ('$_partial' in loadedElement) {
      return instance;
    }
    const attrData = $registeredAttributes.find(e => e.klass === model?.klass);
    const relsData = $registeredRelationships.find(e => e.klass === model?.klass);
    this.parseAttributes(instance, loadedElement, attrData);
    this.parseRelationships(instance, loadedElement, relsData, included);
    return instance;
  }
  wrapWhenPartial(model, loadedElement) {
    if (!loadedElement.$_partial) {
      return new (model?.klass || Model)();
    }
    const instance = new Model();
    return new Proxy(instance, {
      get: function (target, prop) {
        if (prop === "$_partial") {
          return true;
        }
        if (prop in target) {
          return target[prop];
        }
        const propString = prop.toString();
        debug('error', `Trying to call property "${propString}" to a model that is not included. Add "${loadedElement.type}" to included models.`, {
          model: instance,
          property: propString,
          type: DEBUG.ACCESSING_NOT_INCLUDED_MODEL
        });
        return target[prop];
      }
    });
  }
  parseRelationships(instance, loadedElement, relsData, included) {
    for (const key in loadedElement.relationships) {
      const relation = loadedElement.relationships[key];
      const parser = relsData?.attributes?.[key];
      if (parser) {
        instance[parser.key] = parser.parser(this.parse(relation, included));
      } else {
        instance[key] = this.parse(relation, included);
        debug('warn', `Undeclared relationship "${key}" in "${loadedElement.type}"`, {
          relationship: key,
          type: DEBUG.UNDECLARED_RELATIONSHOP
        });
      }
    }
    if (relsData) {
      for (const key in relsData.attributes) {
        const parser = relsData.attributes[key];
        if (!(parser.key in instance)) {
          if ("default" in parser) {
            instance[parser.key] = parser.default;
          } else {
            debug('warn', `Missing relationships "${key}" in "${loadedElement.type}"`, {
              relationship: key,
              type: DEBUG.MISSING_RELATIONSHIP
            });
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
        debug('warn', `Undeclared @Attr() "${key}" in model "${loadedElement.type}"`, {
          attribute: key,
          type: DEBUG.UNDECLARED_ATTRIBUTE
        });
      }
    }
    if (attrData) {
      for (const key in attrData.attributes) {
        const parser = attrData.attributes[key];
        if (!(parser.key in instance)) {
          if ("default" in parser) {
            instance[parser.key] = parser.default;
          } else {
            debug('warn', `Missing attribute "${key}" in "${loadedElement.type}"`, {
              attribute: key,
              type: DEBUG.MISSING_ATTRIBUTE
            });
          }
        }
      }
    }
  }
  static load(element, included) {
    const found = included.find(e => e.id == element.id && e.type === element.type);
    if (!found) {
      debug('info', `Relationship with type ${element.type} with id ${element.id} not present in included. Skipping...`, {
        model: element,
        type: DEBUG.SKIPPED_INCLUDED_RELATIONSHIP
      });
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

exports.Attr = Attr;
exports.DEBUG = DEBUG;
exports.JSONAPI = JSONAPI;
exports.Model = Model;
exports.Parser = Parser;
exports.Rel = Rel;
exports.debug = debug;
