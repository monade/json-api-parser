import { Model } from "../Model";
export declare type DTO<T> = Partial<Omit<T, keyof Model>>;
