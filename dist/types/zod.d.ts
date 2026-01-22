import z from "zod";
import { Model } from "./Model";
interface ZodInteropSchema<A extends z.ZodRawShape, R extends z.ZodRawShape> {
    attributes: z.ZodObject<A>;
    relationships: z.ZodObject<R>;
}
export declare function modelOfType<T extends string>(type: T): z.ZodObject<{
    id: z.ZodString;
    type: z.ZodLiteral<T>;
}, z.core.$strip>;
export declare type InferModel<T extends z.ZodType<any, any, any>> = z.infer<T> & Model;
type MergedShape<A extends z.ZodRawShape, B extends z.ZodRawShape, C extends z.ZodRawShape> = z.ZodObject<A & B & C>;
export declare function declareModel<Type extends string, T extends z.ZodRawShape, V extends z.ZodRawShape, Z extends ZodInteropSchema<T, V>>(type: Type, schema: Z): MergedShape<{
    id: z.ZodString;
    _type: z.ZodString;
}, Z['attributes']['shape'], Z['relationships']['shape']>;
export {};
