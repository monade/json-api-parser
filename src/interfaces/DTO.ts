import { Model } from "../Model";

export type DTO<T> = Partial<Omit<T, keyof Model>>;
