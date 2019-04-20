import { CoreAuth } from "../../auth/local/auth.interface";
import { DefaultFields } from "../../auth/local/auth.types";

export enum Method {
    GET = "get",
    POST = "post",
    ALL = "all",
    PUT = "put",
    DELETE = "delete",
    PATCH = "patch",
}

export type UDD<T> = T extends CoreAuth<infer D, infer U> ? { D: D, U: U }: { D: any, U: any };

export type Decoding<T> = UDD<T>['D'] & DefaultFields;
export type User<T> = UDD<T>['U'];