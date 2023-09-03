import { Model } from "../Model";
import { JSONModel } from "./JSONModel";

type CreateFunction = (instance: Model, modelData: JSONModel, resolverFn: (data: any) => Model | Model[] | null) => Model

export type RegisteredModel = {
  type: string;
  klass?: typeof Model;
  createFn?: CreateFunction;
}
