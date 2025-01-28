import { DTO } from "./interfaces";
export declare class Model {
    id: string;
    _type: string;
    toDTO(): DTO<this>;
    toJSON(maxDepth?: number): any;
    toFormData(): FormData;
}
