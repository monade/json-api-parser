import z from "zod";
import { debug } from "./utils";
import { Model } from "./Model";
import { $registeredModels } from "./data";

interface ZodInteropSchema<A extends z.ZodRawShape, R extends z.ZodRawShape> {
  attributes: z.ZodObject<A>;
  relationships: z.ZodObject<R>;
}

const BaseModelType = z.object({ id: z.string(), _type: z.string() });
type WithType = typeof BaseModelType;

export function modelOfType<T extends string>(type: T) {
  return z.object({ id: z.string(), type: z.literal(type) });
}

export declare type InferModel<T extends z.ZodType<any, any, any>> = T["_output"] & Model;

export function declareModel<Type extends string, T extends z.ZodRawShape, V extends z.ZodRawShape, Z extends ZodInteropSchema<T, V>>(
  type: Type, schema: Z
): z.ZodObject<z.objectUtil.extendShape<WithType['shape'], z.objectUtil.extendShape<Z['attributes']['shape'], Z['relationships']['shape']>>> { //ZodObject<objectUtil.extendShape<Z['attributes']['shape'], Z['relationships']['shape']>, Z['relationships']["_def"]["unknownKeys"], Z['relationships']["_def"]["catchall"]>  {
  $registeredModels.push({
    type, createFn: (instance, { id, attributes, relationships }, resolverFn) => {
      instance.id = id;
      instance._type = type;

      const parsedAttributes = schema.attributes.safeParse(attributes ?? {});
      if (parsedAttributes.success) {
        Object.assign(instance, attributes, parsedAttributes.data);
      } else {
        Object.assign(instance, attributes);
        debug('error', `Error parsing attributes "${type}: ${parsedAttributes.error.message}"`);
      }

      if (schema.relationships['shape']['type']) {
        const parsedRelationships = z.object({ type: schema.relationships['shape']['type'] }).safeParse(attributes ?? {});

        if (!parsedRelationships.success) {
          debug('error', `Error parsing relationships "${type}: ${parsedRelationships.error.message}"`);
        }
      }

      for (const key in relationships) {
        const relation = relationships[key];
        if (schema.relationships['shape'][key]) {
          (instance as any)[key] = resolverFn(relation);
        } else {
          (instance as any)[key] = resolverFn(relation);
          debug('error', `Undeclared relationship "${key}" in "${type}"`);
        }
      }

      for (const key in schema.relationships['shape']) {
        if (!(key in instance)) {
          debug('error', `Missing relationships "${key}" in "${type}"`);
        }
      }

      return instance;
    }
  })

  return schema
    .attributes
    .merge(BaseModelType)
    .merge(schema.relationships) as any;
}
