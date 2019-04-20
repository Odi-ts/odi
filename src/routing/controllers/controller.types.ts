import { IAuth } from "../../auth/auth.interface";

export enum Method {
    GET = "get",
    POST = "post",
    ALL = "all",
    PUT = "put",
    DELETE = "delete",
    PATCH = "patch",
}

export type UDD<T> = T extends IAuth<infer D, infer U, infer F> ? { D: D, U: U, F: F  }: { D: any, U: any, F: any };

export type Decoding<T> = UDD<T>['D'];
export type User<T> = UDD<T>['U'];
export type UserContainer<T> = UDD<T>['F'];