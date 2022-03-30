import { Model } from "../Model";
export declare function Attr(sourceKey?: string, options?: {
    default?: any;
    parser?: (v: any) => any;
}): <T extends Model>(klass: T, key: string) => void;
