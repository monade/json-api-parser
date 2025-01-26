import { JSONData } from "./interfaces/JSONData";
import { JSONModel } from "./interfaces/JSONModel";
import { Model } from "./Model";
import { RegisteredModel } from "./interfaces/RegisteredModel";
export declare class Parser {
    private data;
    private included;
    readonly resolved: Record<string, Model>;
    constructor(data: JSONModel[] | JSONModel, included?: JSONModel[]);
    run<T>(): T | T[] | null;
    private parse;
    parseList(list: JSONModel[], included: JSONModel[]): unknown[];
    parseElement<T>(element: JSONModel, included: JSONModel[]): T;
    wrapWhenPartial(model: RegisteredModel | undefined, loadedElement: JSONModel & {
        $_partial?: boolean;
    }): Model;
    private parseRelationships;
    private parseAttributes;
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
