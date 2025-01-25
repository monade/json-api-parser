import z from "zod";
import { Model } from "./Model";
interface ZodInteropSchema<A extends z.ZodRawShape, R extends z.ZodRawShape> {
    attributes: z.ZodObject<A>;
    relationships: z.ZodObject<R>;
}
declare const BaseModelType: z.ZodObject<{
    id: z.ZodString;
    _type: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    _type: string;
}, {
    id: string;
    _type: string;
}>;
type WithType = typeof BaseModelType;
export declare function modelOfType<T extends string>(type: T): z.ZodObject<{
    id: z.ZodString;
    type: z.ZodLiteral<T>;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    id: z.ZodString;
    type: z.ZodLiteral<T>;
}>, any> extends infer T_1 ? { [k in keyof T_1]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    id: z.ZodString;
    type: z.ZodLiteral<T>;
}>, any>[k]; } : never, z.baseObjectInputType<{
    id: z.ZodString;
    type: z.ZodLiteral<T>;
}> extends infer T_2 ? { [k_1 in keyof T_2]: z.baseObjectInputType<{
    id: z.ZodString;
    type: z.ZodLiteral<T>;
}>[k_1]; } : never>;
export declare type InferModel<T extends z.ZodType<any, any, any>> = T["_output"] & Model;
export declare function declareModel<Type extends string, T extends z.ZodRawShape, V extends z.ZodRawShape, Z extends ZodInteropSchema<T, V>>(type: Type, schema: Z): z.ZodObject<z.objectUtil.extendShape<WithType['shape'], z.objectUtil.extendShape<Z['attributes']['shape'], Z['relationships']['shape']>>>;
export {};
