import { Model } from "../Model";
export interface RegisteredModel {
    type: string;
    klass: typeof Model;
}
