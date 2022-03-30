import { JSONData } from "./interfaces/JSONData";
import { JSONModel } from "./interfaces/JSONModel";
import { RegisteredAttribute } from "./interfaces/RegisteredAttribute";
import { RegisteredModel } from "./interfaces/RegisteredModel";
import { Model } from "./Model";
export declare class Parser {
    private data;
    private included;
    static $registeredModels: RegisteredModel[];
    static $registeredAttributes: RegisteredAttribute[];
    static $registeredRelationships: RegisteredAttribute[];
    readonly resolved: Record<string, Model>;
    constructor(data: JSONModel[] | JSONModel, included?: JSONModel[]);
    run<T>(): T | T[] | null;
    private parse;
    parseList(list: JSONModel[], included: JSONModel[]): unknown[];
    parseElement<T>(element: JSONModel, included: JSONModel[]): T;
    static load(element: JSONModel, included: JSONModel[]): JSONModel | {
        $_partial: boolean;
        id: string;
        type: string;
        attributes?: {
            [key: string]: any;
        } | undefined;
        relationships?: {
            [key: string]: JSONData;
        } | undefined;
    };
}
