import { JSONModel } from "./JSONModel";
export interface JSONData {
    data: JSONModel | JSONModel[];
    included: JSONModel[];
}
