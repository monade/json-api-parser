import { JSONData } from "./JSONData";
export interface JSONModel {
    id: string;
    type: string;
    attributes?: {
        [key: string]: any;
    };
    relationships?: {
        [key: string]: JSONData;
    };
}
