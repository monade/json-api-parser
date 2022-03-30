import { Model } from "../Model";
export declare function JSONAPI(type: string): <T extends typeof Model>(constructor: T) => void;
