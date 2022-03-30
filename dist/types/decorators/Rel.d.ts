import { Model } from "../Model";
export declare function Rel(sourceKey?: string, options?: {
    default?: any;
    parser?: (v: any) => any;
}): <T extends Model>(klass: T, key: string) => void;
