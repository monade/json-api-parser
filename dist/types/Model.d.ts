import { DTO } from "./interfaces";
export declare class Model {
    id: string;
    _type: string;
    toDTO<T extends Model = typeof this>(): DTO<T>;
    toJSON(maxDepth?: number): any;
    toFormData(): FormData;
}
