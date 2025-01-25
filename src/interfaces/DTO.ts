import { Model } from "../Model";

type Collect<T extends object> = { [K in keyof T]: T[K] }

export type RelToId<T extends Model> = Collect<
{ [K in keyof T as T[K] extends Model | null | undefined ? never : K]: T[K] } &
{ [K in Extract<keyof T, string> as T[K] extends Model | null | undefined ? `${K}Id` : never]: string }
>

export type DTO<T extends Model> = Omit<RelToId<T>, keyof Model>;
