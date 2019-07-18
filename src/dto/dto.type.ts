import { ValidateFunction } from "ajv";

export type ValidatorFormat = "date"
    | "time"
    | "date-time"
    | "uri"
    | "uri-reference"
    | "uri-template"
    | "url"
    | "email"
    | "hostname"
    | "ipv4"
    | "ipv6"
    | "regex"
    | "uuid"
    | "json-pointer"
    | "relative-json-pointer";

export type CustomValidateFunction = (propertyData: any) => boolean | Promise<boolean>;
