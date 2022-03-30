import { JSONModel } from "./JSONModel";

export interface JSONDataWithMeta<Meta> {
  data: JSONModel | JSONModel[];
  included: JSONModel[];
  links?: {
    self: string;
    related?: string;
  },
  meta?: Meta;
}

export interface JSONData extends JSONDataWithMeta<any> {}
